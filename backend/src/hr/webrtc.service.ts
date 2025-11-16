import { Injectable } from '@nestjs/common';
import Database from 'better-sqlite3';
import * as path from 'path';

interface SIPCredentials {
  username: string;
  password: string;
  extension: string;
  wsUrl: string;
}

interface WebRTCConfig {
  stunServer: string;
  turnServer?: string;
  turnUsername?: string;
  turnPassword?: string;
  asteriskWsUrl: string;
}

@Injectable()
export class WebRTCService {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(__dirname, '../../callcenter.db');
    this.db = new Database(dbPath);
  }

  async getUserSIPCredentials(userId: string): Promise<SIPCredentials | null> {
    const stmt = this.db.prepare(`
      SELECT 
        sip_username as username,
        sip_password as password,
        sip_extension as extension
      FROM users
      WHERE id = ?
    `);

    const user = stmt.get(userId) as any;

    if (!user || !user.username) {
      return null;
    }

    // Get WebRTC config for WS URL
    const configStmt = this.db.prepare(`
      SELECT asterisk_ws_url as wsUrl
      FROM webrtc_config
      WHERE id = 'default'
    `);

    const config = configStmt.get() as any;

    return {
      username: user.username,
      password: user.password,
      extension: user.extension,
      wsUrl: config?.wsUrl || 'ws://localhost:8088/ws',
    };
  }

  async getWebRTCConfiguration(): Promise<WebRTCConfig> {
    const stmt = this.db.prepare(`
      SELECT 
        stun_server as stunServer,
        turn_server as turnServer,
        turn_username as turnUsername,
        turn_password as turnPassword,
        asterisk_ws_url as asteriskWsUrl
      FROM webrtc_config
      WHERE id = 'default'
    `);

    const config = stmt.get() as any;

    return config || {
      stunServer: 'stun:stun.l.google.com:19302',
      asteriskWsUrl: 'ws://localhost:8088/ws',
    };
  }

  async getICEServers(): Promise<any[]> {
    const config = await this.getWebRTCConfiguration();
    const iceServers: any[] = [];

    // Add STUN server
    if (config.stunServer) {
      iceServers.push({
        urls: config.stunServer,
      });
    }

    // Add TURN server if configured
    if (config.turnServer) {
      iceServers.push({
        urls: config.turnServer,
        username: config.turnUsername,
        credential: config.turnPassword,
      });
    }

    return iceServers;
  }

  // Generate Asterisk pjsip.conf content for an agent
  generatePJSIPConfig(username: string, password: string, extension: string): string {
    return `
; Agent: ${username}
[${username}]
type=aor
max_contacts=1
remove_existing=yes

[${username}]
type=auth
auth_type=userpass
username=${username}
password=${password}

[${username}]
type=endpoint
context=from-internal
disallow=all
allow=ulaw
allow=alaw
allow=opus
webrtc=yes
aors=${username}
auth=${username}
use_avpf=yes
media_encryption=dtls
dtls_verify=fingerprint
dtls_cert_file=/etc/asterisk/keys/asterisk.pem
dtls_ca_file=/etc/asterisk/keys/ca.crt
dtls_setup=actpass
ice_support=yes
media_use_received_transport=yes
rtcp_mux=yes
`;
  }

  // Generate extensions.conf dialplan for agent
  generateDialplanConfig(extension: string, username: string): string {
    return `
; Extension for ${username}
exten => ${extension},1,NoOp(Incoming call to ${username})
 same => n,Dial(PJSIP/${username},30)
 same => n,Hangup()
`;
  }

  async getAllAgentConfigs(): Promise<string> {
    const stmt = this.db.prepare(`
      SELECT 
        sip_username as username,
        sip_password as password,
        sip_extension as extension,
        name
      FROM users
      WHERE sip_username IS NOT NULL AND accountType IN ('agent', 'supervisor', 'admin')
    `);

    const agents = stmt.all() as any[];

    let pjsipConfig = '; ===== Auto-generated WebRTC Agent Configurations =====\n';
    let dialplanConfig = '; ===== Auto-generated Agent Extensions =====\n';

    for (const agent of agents) {
      pjsipConfig += this.generatePJSIPConfig(
        agent.username,
        agent.password,
        agent.extension,
      );

      dialplanConfig += this.generateDialplanConfig(
        agent.extension,
        agent.username,
      );
    }

    return `
PJSIP Configuration (add to /etc/asterisk/pjsip.conf):
${pjsipConfig}

Dialplan Configuration (add to /etc/asterisk/extensions.conf):
${dialplanConfig}
`;
  }
}
