/**
 * WebRTC Client for SIP calling using JsSIP
 * Connects to Asterisk via WebSocket for browser-based calling
 */

import JsSIP from 'jssip';

export interface CallOptions {
  audioElement?: HTMLAudioElement;
  onConnecting?: () => void;
  onConnected?: () => void;
  onEnded?: () => void;
  onFailed?: (cause: string) => void;
}

export interface WebRTCConfig {
  wsServer: string; // wss://your-server.com:8089/ws
  sipUri: string; // sip:username@domain.com
  password: string;
  displayName: string;
  stunServers?: string[];
  turnServers?: Array<{
    urls: string;
    username?: string;
    credential?: string;
  }>;
}

export class WebRTCClient {
  private ua: JsSIP.UA | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private currentSession: any = null;
  private config: WebRTCConfig;
  private remoteAudio: HTMLAudioElement;
  private localStream: MediaStream | null = null;

  constructor(config: WebRTCConfig) {
    this.config = config;
    
    // Create audio element for remote audio
    this.remoteAudio = document.createElement('audio');
    this.remoteAudio.autoplay = true;
    document.body.appendChild(this.remoteAudio);

    // Enable JsSIP debug (disable in production)
    if (process.env.NODE_ENV === 'development') {
      JsSIP.debug.enable('JsSIP:*');
    }
  }

  /**
   * Initialize and register the SIP client
   */
  async register(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const socket = new JsSIP.WebSocketInterface(this.config.wsServer);

        const configuration = {
          sockets: [socket],
          uri: this.config.sipUri,
          password: this.config.password,
          display_name: this.config.displayName,
          session_timers: false,
          register: true,
          register_expires: 600,
          connection_recovery_min_interval: 2,
          connection_recovery_max_interval: 30,
        };

        this.ua = new JsSIP.UA(configuration);

        // Handle registration events
        this.ua.on('registered', () => {
          console.log('✅ SIP registered successfully');
          resolve();
        });

        this.ua.on('registrationFailed', (e: any) => {
          console.error('❌ SIP registration failed:', e.cause);
          reject(new Error(`Registration failed: ${e.cause}`));
        });

        this.ua.on('unregistered', () => {
          console.log('📴 SIP unregistered');
        });

        // Handle incoming calls
        this.ua.on('newRTCSession', (data: any) => {
          const session = data.session;

          if (session.direction === 'incoming') {
            this.handleIncomingCall(session);
          }
        });

        // Start the UA
        this.ua.start();
      } catch (error) {
        console.error('❌ WebRTC initialization failed:', error);
        reject(error);
      }
    });
  }

  /**
   * Make an outgoing call
   */
  async makeCall(extension: string, options: CallOptions = {}): Promise<void> {
    if (!this.ua) {
      throw new Error('UA not initialized. Call register() first.');
    }

    // Get user media
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
    } catch (error) {
      console.error('❌ Failed to get user media:', error);
      throw new Error('Microphone access denied');
    }

    const callOptions = {
      mediaConstraints: {
        audio: true,
        video: false,
      },
      pcConfig: {
        iceServers: this.getIceServers(),
      },
    };

    // Dial the extension
    const session = this.ua.call(`sip:${extension}@${this.getSipDomain()}`, callOptions);
    this.currentSession = session;

    // Handle call events
    this.setupCallEventHandlers(session, options);
  }

  /**
   * Answer an incoming call
   */
  answerCall(options: CallOptions = {}): void {
    if (!this.currentSession) {
      throw new Error('No incoming call to answer');
    }

    const answerOptions = {
      mediaConstraints: {
        audio: true,
        video: false,
      },
      pcConfig: {
        iceServers: this.getIceServers(),
      },
    };

    this.currentSession.answer(answerOptions);
    this.setupCallEventHandlers(this.currentSession, options);
  }

  /**
   * Hang up the current call
   */
  hangup(): void {
    if (this.currentSession) {
      this.currentSession.terminate();
      this.currentSession = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }

  /**
   * Mute/unmute microphone
   */
  toggleMute(): boolean {
    if (!this.currentSession) return false;

    if (this.currentSession.isMuted().audio) {
      this.currentSession.unmute({ audio: true });
      return false;
    } else {
      this.currentSession.mute({ audio: true });
      return true;
    }
  }

  /**
   * Hold/unhold call
   */
  toggleHold(): boolean {
    if (!this.currentSession) return false;

    if (this.currentSession.isOnHold().local) {
      this.currentSession.unhold();
      return false;
    } else {
      this.currentSession.hold();
      return true;
    }
  }

  /**
   * Send DTMF tones (for IVR navigation)
   */
  sendDTMF(digit: string): void {
    if (!this.currentSession) return;

    this.currentSession.sendDTMF(digit);
    console.log('📞 Sent DTMF:', digit);
  }

  /**
   * Transfer call to another extension
   */
  transfer(target: string): void {
    if (!this.currentSession) return;

    this.currentSession.refer(`sip:${target}@${this.getSipDomain()}`);
    console.log('📞 Transferring call to:', target);
  }

  /**
   * Unregister and cleanup
   */
  async unregister(): Promise<void> {
    if (this.currentSession) {
      this.hangup();
    }

    if (this.ua) {
      this.ua.stop();
      this.ua = null;
    }

    if (this.remoteAudio) {
      document.body.removeChild(this.remoteAudio);
    }
  }

  /**
   * Get current call state
   */
  getCallState(): string | null {
    if (!this.currentSession) return null;
    return this.currentSession.status_code?.toString() || 'unknown';
  }

  /**
   * Check if currently in a call
   */
  isInCall(): boolean {
    return this.currentSession !== null && this.currentSession.isEstablished();
  }

  // Private methods

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleIncomingCall(session: any): void {
    console.log('📞 Incoming call from:', session.remote_identity.uri.user);
    
    this.currentSession = session;

    // Trigger incoming call event (you can emit this to your UI)
    const event = new CustomEvent('incoming-call', {
      detail: {
        callerNumber: session.remote_identity.uri.user,
        callerName: session.remote_identity.display_name || 'Unknown',
        session: session,
      },
    });
    window.dispatchEvent(event);

    // Setup handlers for when call is answered
    session.on('accepted', () => {
      console.log('✅ Incoming call accepted');
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private setupCallEventHandlers(session: any, options: CallOptions): void {
    session.on('connecting', () => {
      console.log('📞 Call connecting...');
      options.onConnecting?.();
    });

    session.on('progress', () => {
      console.log('📞 Call in progress (ringing)...');
    });

    session.on('accepted', () => {
      console.log('✅ Call connected');
      options.onConnected?.();
    });

    session.on('confirmed', () => {
      console.log('✅ Call confirmed');
    });

    session.on('ended', () => {
      console.log('📴 Call ended');
      this.currentSession = null;
      options.onEnded?.();
    });

    session.on('failed', (e: any) => {
      console.error('❌ Call failed:', e.cause);
      this.currentSession = null;
      options.onFailed?.(e.cause);
    });

    // Handle remote audio stream
    session.on('peerconnection', (e: any) => {
      const peerConnection = e.peerconnection;

      peerConnection.addEventListener('addstream', (event: any) => {
        console.log('🎵 Remote stream added');
        this.remoteAudio.srcObject = event.stream;
        this.remoteAudio.play().catch((err) => {
          console.error('Failed to play remote audio:', err);
        });
      });

      peerConnection.addEventListener('track', (event: any) => {
        if (event.streams && event.streams[0]) {
          console.log('🎵 Remote track added');
          this.remoteAudio.srcObject = event.streams[0];
          this.remoteAudio.play().catch((err) => {
            console.error('Failed to play remote audio:', err);
          });
        }
      });
    });
  }

  private getIceServers(): RTCIceServer[] {
    const servers: RTCIceServer[] = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ];

    // Add custom STUN servers
    if (this.config.stunServers) {
      servers.push(
        ...this.config.stunServers.map((url) => ({ urls: url }))
      );
    }

    // Add TURN servers
    if (this.config.turnServers) {
      servers.push(...this.config.turnServers);
    }

    return servers;
  }

  private getSipDomain(): string {
    const match = this.config.sipUri.match(/@(.+)/);
    return match ? match[1] : 'localhost';
  }
}

/**
 * Factory function to create and register a WebRTC client
 */
export async function createWebRTCClient(
  config: WebRTCConfig
): Promise<WebRTCClient> {
  const client = new WebRTCClient(config);
  await client.register();
  return client;
}
