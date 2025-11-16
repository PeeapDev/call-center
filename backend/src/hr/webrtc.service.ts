import { Injectable } from '@nestjs/common';
import { HrService } from './hr.service';

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
  constructor(private readonly hrService: HrService) {}

  async getUserSIPCredentials(userId: string): Promise<SIPCredentials | null> {
    try {
      const user = await this.hrService.getUserById(userId);

      if (!user || !user.sipUsername) {
        return null;
      }

      // Get WebRTC config for WS URL
      const config = await this.hrService.getWebRTCConfig();

      return {
        username: user.sipUsername,
        password: user.sipPassword!,
        extension: user.sipExtension!,
        wsUrl: config.asteriskWsUrl || 'ws://localhost:8088/ws',
      };
    } catch (error) {
      console.error('Error getting SIP credentials:', error);
      return null;
    }
  }

  async getWebRTCConfiguration(): Promise<WebRTCConfig> {
    try {
      const config = await this.hrService.getWebRTCConfig();
      return {
        stunServer: config.stunServer,
        turnServer: config.turnServer,
        turnUsername: config.turnUsername,
        turnPassword: config.turnPassword,
        asteriskWsUrl: config.asteriskWsUrl,
      };
    } catch (error) {
      console.error('Error getting WebRTC config:', error);
      return {
        stunServer: 'stun:stun.l.google.com:19302',
        asteriskWsUrl: 'ws://localhost:8088/ws',
      };
    }
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
    try {
      const agents = await this.hrService.getUsers({
        accountType: 'agent',
        isActive: true
      });

      const sipAgents = agents.filter(agent => agent.sipUsername);

      let pjsipConfig = '; ===== Auto-generated WebRTC Agent Configurations =====\n';
      let dialplanConfig = '; ===== Auto-generated Agent Extensions =====\n';

      for (const agent of sipAgents) {
        if (agent.sipUsername && agent.sipPassword && agent.sipExtension) {
          pjsipConfig += this.generatePJSIPConfig(
            agent.sipUsername,
            agent.sipPassword,
            agent.sipExtension,
          );

          dialplanConfig += this.generateDialplanConfig(
            agent.sipExtension,
            agent.sipUsername,
          );
        }
      }

      return `
PJSIP Configuration (add to /etc/asterisk/pjsip.conf):
${pjsipConfig}

Dialplan Configuration (add to /etc/asterisk/extensions.conf):
${dialplanConfig}
`;
    } catch (error) {
      console.error('Error getting agent configs:', error);
      return 'Error generating configurations';
    }
  }
}
