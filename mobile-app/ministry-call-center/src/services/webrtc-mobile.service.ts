/**
 * Mobile WebRTC Service for SIP calling
 * Handles registration, calls, and media for React Native
 */

import { mediaDevices, RTCPeerConnection, MediaStream } from 'react-native-webrtc';
// @ts-ignore
import JsSIP from 'jssip';

export interface CallEventHandlers {
  onConnecting?: () => void;
  onConnected?: () => void;
  onEnded?: () => void;
  onFailed?: (cause: string) => void;
  onIncoming?: (callerNumber: string, callerName: string) => void;
}

export class MobileWebRTCService {
  private ua: any = null;
  private currentSession: any = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private eventHandlers: CallEventHandlers = {};

  constructor(
    private config: {
      wsServer: string;
      sipUri: string;
      password: string;
      displayName: string;
    }
  ) {
    // Enable JsSIP debug in development
    if (__DEV__) {
      JsSIP.debug.enable('JsSIP:*');
    }
  }

  /**
   * Register with Asterisk SIP server
   */
  async register(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔌 Connecting to WebRTC server:', this.config.wsServer);

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

        // Registration events
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
            console.log('📞 Incoming call from:', session.remote_identity.uri.user);
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
  async makeCall(extension: string, handlers: CallEventHandlers = {}): Promise<void> {
    if (!this.ua) {
      throw new Error('UA not initialized. Call register() first.');
    }

    this.eventHandlers = handlers;

    try {
      console.log('🎤 Requesting microphone permission...');

      // Get user media
      this.localStream = await mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      console.log('✅ Microphone permission granted');
      console.log('📞 Calling extension:', extension);

      const callOptions = {
        mediaConstraints: {
          audio: true,
          video: false,
        },
        pcConfig: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
        mediaStream: this.localStream,
      };

      // Extract domain from SIP URI
      const domain = this.config.sipUri.split('@')[1];

      // Make the call
      const session = this.ua.call(`sip:${extension}@${domain}`, callOptions);
      this.currentSession = session;

      // Setup call event handlers
      this.setupCallEventHandlers(session);
    } catch (error: any) {
      console.error('❌ Failed to make call:', error);
      if (error.name === 'PermissionDeniedError') {
        throw new Error('Microphone permission denied');
      }
      throw error;
    }
  }

  /**
   * Answer an incoming call
   */
  answerCall(handlers: CallEventHandlers = {}): void {
    if (!this.currentSession) {
      throw new Error('No incoming call to answer');
    }

    this.eventHandlers = handlers;

    const answerOptions = {
      mediaConstraints: {
        audio: true,
        video: false,
      },
      pcConfig: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
    };

    this.currentSession.answer(answerOptions);
    this.setupCallEventHandlers(this.currentSession);
  }

  /**
   * Hang up the current call
   */
  hangup(): void {
    if (this.currentSession) {
      console.log('📴 Hanging up call...');
      this.currentSession.terminate();
      this.cleanup();
    }
  }

  /**
   * Mute/unmute microphone
   */
  toggleMute(): boolean {
    if (!this.currentSession) return false;

    if (this.currentSession.isMuted().audio) {
      this.currentSession.unmute({ audio: true });
      console.log('🎤 Microphone unmuted');
      return false;
    } else {
      this.currentSession.mute({ audio: true });
      console.log('🔇 Microphone muted');
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
      console.log('▶️ Call resumed');
      return false;
    } else {
      this.currentSession.hold();
      console.log('⏸️ Call on hold');
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
   * Check if currently in a call
   */
  isInCall(): boolean {
    return this.currentSession !== null && this.currentSession.isEstablished();
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

    this.cleanup();
  }

  // Private methods

  private handleIncomingCall(session: any): void {
    this.currentSession = session;

    const callerNumber = session.remote_identity.uri.user;
    const callerName = session.remote_identity.display_name || 'Unknown';

    if (this.eventHandlers.onIncoming) {
      this.eventHandlers.onIncoming(callerNumber, callerName);
    }

    // Setup handlers when call is answered
    session.on('accepted', () => {
      console.log('✅ Incoming call accepted');
    });
  }

  private setupCallEventHandlers(session: any): void {
    session.on('connecting', () => {
      console.log('📞 Call connecting...');
      this.eventHandlers.onConnecting?.();
    });

    session.on('progress', () => {
      console.log('📞 Call in progress (ringing)...');
    });

    session.on('accepted', () => {
      console.log('✅ Call connected');
      this.eventHandlers.onConnected?.();
    });

    session.on('confirmed', () => {
      console.log('✅ Call confirmed');
    });

    session.on('ended', () => {
      console.log('📴 Call ended');
      this.cleanup();
      this.eventHandlers.onEnded?.();
    });

    session.on('failed', (e: any) => {
      console.error('❌ Call failed:', e.cause);
      this.cleanup();
      this.eventHandlers.onFailed?.(e.cause);
    });

    // Handle remote audio stream
    session.on('peerconnection', (e: any) => {
      const peerConnection = e.peerconnection;

      peerConnection.addEventListener('addstream', (event: any) => {
        console.log('🎵 Remote stream added');
        this.remoteStream = event.stream;
      });

      peerConnection.addEventListener('track', (event: any) => {
        if (event.streams && event.streams[0]) {
          console.log('🎵 Remote track added');
          this.remoteStream = event.streams[0];
        }
      });
    });
  }

  private cleanup(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    this.remoteStream = null;
    this.currentSession = null;
  }

  /**
   * Get remote stream for playback
   */
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }
}
