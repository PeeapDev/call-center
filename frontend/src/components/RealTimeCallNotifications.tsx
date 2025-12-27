'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneIncoming, PhoneOff, Mic, MicOff, Volume2, Pause, Play, PhoneForwarded, Keyboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { BACKEND_URL, ASTERISK_WS_URL, buildApiUrl } from '@/lib/config';

interface IncomingCall {
  callId: string;
  callerName: string;
  phoneNumber: string;
  ivrOption: string;
  queueName: string;
  timestamp: string;
}

interface CallSession {
  callId: string;
  callerName: string;
  phoneNumber: string;
  duration: number;
  isMuted: boolean;
  isOnHold: boolean;
}

interface AgentCredentials {
  sipUsername: string;
  sipPassword: string;
  sipExtension: string;
  wsUrl: string;
}

export default function RealTimeCallNotifications() {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [incomingCalls, setIncomingCalls] = useState<IncomingCall[]>([]);
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [webrtcRegistered, setWebrtcRegistered] = useState(false);
  const [agentCredentials, setAgentCredentials] = useState<AgentCredentials | null>(null);
  const [showDialpad, setShowDialpad] = useState(false);
  const [dialNumber, setDialNumber] = useState('');
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const uaRef = useRef<any>(null);
  const currentSessionRef = useRef<any>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  const user = session?.user as any;

  // Fetch agent's SIP credentials
  useEffect(() => {
    if (user?.phone) {
      fetchAgentCredentials();
    }
  }, [user]);

  const fetchAgentCredentials = async () => {
    try {
      const response = await fetch(buildApiUrl(`/hr/webrtc-config/${user.phone}`));
      const data = await response.json();
      if (data.status === 'ok' && data.config) {
        setAgentCredentials({
          sipUsername: data.config.sipUsername,
          sipPassword: data.config.sipPassword,
          sipExtension: data.config.extension,
          wsUrl: ASTERISK_WS_URL,
        });
      }
    } catch (error) {
      console.error('Failed to fetch SIP credentials:', error);
    }
  };

  // Initialize WebSocket connection to backend
  useEffect(() => {
    const wsUrl = BACKEND_URL.replace('https://', 'wss://').replace('http://', 'ws://');
    const socketInstance = io(`${wsUrl}/calls`, {
      transports: ['websocket', 'polling'],
      path: '/socket.io',
    });

    socketInstance.on('connect', () => {
      console.log('Connected to call server');
      setIsConnected(true);
      setSocket(socketInstance);

      // Register as agent with user info
      socketInstance.emit('agent:register', {
        agentId: user?.id || 'agent_' + Date.now(),
        agentName: user?.name || 'Agent',
        extension: agentCredentials?.sipExtension || '1000',
      });
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from call server');
      setIsConnected(false);
    });

    socketInstance.on('agent:registered', (data) => {
      console.log('Agent registered:', data);
    });

    // Listen for incoming calls
    socketInstance.on('call:incoming', (call: IncomingCall) => {
      console.log('INCOMING CALL:', call);
      playNotificationSound();
      setIncomingCalls((prev) => {
        if (prev.some(c => c.callId === call.callId)) return prev;
        return [...prev, call];
      });
    });

    // Listen for call taken by another agent
    socketInstance.on('call:taken', (data: { callId: string; agentName: string }) => {
      console.log('Call taken by another agent:', data);
      setIncomingCalls((prev) => prev.filter(c => c.callId !== data.callId));
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [user, agentCredentials]);

  // Call duration timer
  useEffect(() => {
    if (activeCall) {
      durationInterval.current = setInterval(() => {
        setActiveCall((prev) => {
          if (!prev) return null;
          return { ...prev, duration: prev.duration + 1 };
        });
      }, 1000);
    } else {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [activeCall]);

  const playNotificationSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  // Initialize WebRTC with JsSIP
  const initializeWebRTC = useCallback(async () => {
    if (!agentCredentials || uaRef.current) return;

    // Dynamically import JsSIP
    const JsSIP = (await import('jssip')).default;

    // Create audio element for remote audio
    if (!remoteAudioRef.current) {
      remoteAudioRef.current = document.createElement('audio');
      remoteAudioRef.current.autoplay = true;
      document.body.appendChild(remoteAudioRef.current);
    }

    const domain = new URL(agentCredentials.wsUrl).hostname;
    const socket = new JsSIP.WebSocketInterface(agentCredentials.wsUrl);

    const configuration = {
      sockets: [socket],
      uri: `sip:${agentCredentials.sipUsername}@${domain}`,
      password: agentCredentials.sipPassword,
      display_name: user?.name || 'Agent',
      session_timers: false,
      register: true,
      register_expires: 600,
    };

    const ua = new JsSIP.UA(configuration);

    ua.on('registered', () => {
      console.log('WebRTC SIP registered');
      setWebrtcRegistered(true);
    });

    ua.on('registrationFailed', (e: any) => {
      console.error('WebRTC registration failed:', e.cause);
      setWebrtcRegistered(false);
    });

    ua.on('newRTCSession', (data: any) => {
      const session = data.session;
      if (session.direction === 'incoming') {
        handleIncomingWebRTCCall(session);
      }
    });

    ua.start();
    uaRef.current = ua;
  }, [agentCredentials, user]);

  const handleIncomingWebRTCCall = (session: any) => {
    currentSessionRef.current = session;

    // Auto-answer or handle with UI
    session.on('peerconnection', (e: any) => {
      const pc = e.peerconnection;
      pc.addEventListener('track', (event: any) => {
        if (event.streams && event.streams[0] && remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
          remoteAudioRef.current.play().catch(console.error);
        }
      });
    });

    session.on('ended', () => {
      setActiveCall(null);
      currentSessionRef.current = null;
    });

    session.on('failed', () => {
      setActiveCall(null);
      currentSessionRef.current = null;
    });
  };

  const answerCall = async (call: IncomingCall) => {
    try {
      console.log('Answering call:', call.callId);

      // Notify backend that agent accepted the call
      if (socket) {
        socket.emit('call:accept', { callId: call.callId });
      }

      // Claim the call in backend
      await fetch(buildApiUrl(`/calls/${call.callId}/claim`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: user?.id,
          agentName: user?.name,
          extension: agentCredentials?.sipExtension,
        }),
      });

      // Remove from incoming list
      setIncomingCalls((prev) => prev.filter(c => c.callId !== call.callId));

      // Set as active call
      setActiveCall({
        callId: call.callId,
        callerName: call.callerName,
        phoneNumber: call.phoneNumber,
        duration: 0,
        isMuted: false,
        isOnHold: false,
      });

      // If there's a pending WebRTC session, answer it
      if (currentSessionRef.current && currentSessionRef.current.direction === 'incoming') {
        currentSessionRef.current.answer({
          mediaConstraints: { audio: true, video: false },
        });
      }

    } catch (error) {
      console.error('Failed to answer call:', error);
    }
  };

  const makeCall = async (extension: string) => {
    if (!uaRef.current || !webrtcRegistered) {
      alert('WebRTC not registered. Please wait...');
      return;
    }

    try {
      const domain = new URL(agentCredentials!.wsUrl).hostname;
      const session = uaRef.current.call(`sip:${extension}@${domain}`, {
        mediaConstraints: { audio: true, video: false },
      });

      currentSessionRef.current = session;

      session.on('connecting', () => console.log('Call connecting...'));
      session.on('progress', () => console.log('Call ringing...'));
      session.on('accepted', () => {
        setActiveCall({
          callId: 'outbound_' + Date.now(),
          callerName: `Extension ${extension}`,
          phoneNumber: extension,
          duration: 0,
          isMuted: false,
          isOnHold: false,
        });
      });

      session.on('peerconnection', (e: any) => {
        const pc = e.peerconnection;
        pc.addEventListener('track', (event: any) => {
          if (event.streams && event.streams[0] && remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = event.streams[0];
            remoteAudioRef.current.play().catch(console.error);
          }
        });
      });

      session.on('ended', () => {
        setActiveCall(null);
        currentSessionRef.current = null;
      });

      session.on('failed', (e: any) => {
        console.error('Call failed:', e.cause);
        setActiveCall(null);
        currentSessionRef.current = null;
      });

    } catch (error) {
      console.error('Failed to make call:', error);
    }
  };

  const endCall = async () => {
    if (!activeCall) return;

    try {
      // Notify backend
      if (socket) {
        socket.emit('call:ended', { callId: activeCall.callId });
      }

      // End WebRTC call
      if (currentSessionRef.current) {
        currentSessionRef.current.terminate();
        currentSessionRef.current = null;
      }

      // End call in backend database
      await fetch(buildApiUrl(`/calls/${activeCall.callId}/end`), {
        method: 'POST',
      });

      setActiveCall(null);
      console.log('Call ended');
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  const toggleMute = () => {
    if (!activeCall || !currentSessionRef.current) return;

    if (activeCall.isMuted) {
      currentSessionRef.current.unmute({ audio: true });
    } else {
      currentSessionRef.current.mute({ audio: true });
    }
    setActiveCall((prev) => prev ? { ...prev, isMuted: !prev.isMuted } : null);
  };

  const toggleHold = () => {
    if (!activeCall || !currentSessionRef.current) return;

    if (activeCall.isOnHold) {
      currentSessionRef.current.unhold();
    } else {
      currentSessionRef.current.hold();
    }
    setActiveCall((prev) => prev ? { ...prev, isOnHold: !prev.isOnHold } : null);
  };

  const sendDTMF = (digit: string) => {
    if (currentSessionRef.current) {
      currentSessionRef.current.sendDTMF(digit);
    }
    setDialNumber(prev => prev + digit);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getIVRLabel = (option: string) => {
    const labels: Record<string, string> = {
      '1': 'Exam Inquiries',
      '2': 'Teacher Complaints',
      '3': 'School Facilities',
      '4': 'Other Services',
    };
    return labels[option] || `Option ${option}`;
  };

  return (
    <div className="space-y-4">
      {/* Connection Status Bar */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm font-medium">
              {isConnected ? 'Server Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${webrtcRegistered ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium">
              {webrtcRegistered ? 'Phone Ready' : 'Phone Offline'}
            </span>
          </div>
        </div>
        {agentCredentials && !webrtcRegistered && (
          <Button size="sm" onClick={initializeWebRTC} className="bg-blue-600">
            <Phone className="w-4 h-4 mr-2" />
            Register Phone
          </Button>
        )}
        {agentCredentials && (
          <Badge variant="outline" className="text-xs">
            Ext: {agentCredentials.sipExtension}
          </Badge>
        )}
      </div>

      {/* Dialpad / Make Call */}
      {webrtcRegistered && !activeCall && (
        <Card className="border border-gray-200">
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              Quick Dial
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={dialNumber}
                onChange={(e) => setDialNumber(e.target.value)}
                placeholder="Enter extension (e.g., 600)"
                className="flex-1 px-3 py-2 border rounded-md text-sm"
              />
              <Button
                onClick={() => makeCall(dialNumber)}
                disabled={!dialNumber}
                className="bg-green-600 hover:bg-green-700"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                <Button
                  key={digit}
                  variant="outline"
                  size="sm"
                  onClick={() => setDialNumber(prev => prev + digit)}
                  className="h-10"
                >
                  {digit}
                </Button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Dial 600 for echo test | 800 for queue
            </p>
          </CardContent>
        </Card>
      )}

      {/* Active Call */}
      {activeCall && (
        <Card className="border-2 border-green-500 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-green-600 animate-pulse" />
                <span>Active Call</span>
                {activeCall.isOnHold && <Badge variant="secondary">ON HOLD</Badge>}
              </div>
              <Badge variant="default" className="text-lg font-mono bg-green-600">
                {formatDuration(activeCall.duration)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold mb-3">
                  {activeCall.callerName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="text-2xl font-bold">{activeCall.callerName}</div>
                <div className="text-gray-600">{activeCall.phoneNumber}</div>
              </div>

              {/* Call Controls */}
              <div className="flex gap-2 justify-center flex-wrap">
                <Button
                  onClick={toggleMute}
                  variant={activeCall.isMuted ? 'destructive' : 'outline'}
                  size="lg"
                >
                  {activeCall.isMuted ? <MicOff className="mr-2 h-5 w-5" /> : <Mic className="mr-2 h-5 w-5" />}
                  {activeCall.isMuted ? 'Unmute' : 'Mute'}
                </Button>

                <Button
                  onClick={toggleHold}
                  variant={activeCall.isOnHold ? 'secondary' : 'outline'}
                  size="lg"
                >
                  {activeCall.isOnHold ? <Play className="mr-2 h-5 w-5" /> : <Pause className="mr-2 h-5 w-5" />}
                  {activeCall.isOnHold ? 'Resume' : 'Hold'}
                </Button>

                <Button
                  onClick={() => setShowDialpad(!showDialpad)}
                  variant="outline"
                  size="lg"
                >
                  <Keyboard className="mr-2 h-5 w-5" />
                  Keypad
                </Button>

                <Button onClick={endCall} variant="destructive" size="lg">
                  <PhoneOff className="mr-2 h-5 w-5" />
                  End
                </Button>
              </div>

              {/* In-call Dialpad */}
              {showDialpad && (
                <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mt-4">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                    <Button
                      key={digit}
                      variant="outline"
                      onClick={() => sendDTMF(digit)}
                      className="h-12 text-lg font-semibold"
                    >
                      {digit}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Incoming Calls */}
      {incomingCalls.length > 0 && (
        <Card className="border-2 border-blue-500">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2">
              <PhoneIncoming className="h-5 w-5 text-blue-600 animate-bounce" />
              Incoming Calls
              <Badge variant="destructive" className="animate-pulse">
                {incomingCalls.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <AnimatePresence>
                {incomingCalls.map((call) => (
                  <motion.div
                    key={call.callId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 border-2 border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Volume2 className="h-5 w-5 text-blue-600 animate-pulse" />
                          <div className="text-xl font-bold">{call.callerName}</div>
                        </div>
                        <div className="text-sm text-gray-600">{call.phoneNumber}</div>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline">{getIVRLabel(call.ivrOption)}</Badge>
                          <Badge variant="secondary">{call.queueName}</Badge>
                        </div>
                      </div>

                      <Button
                        onClick={() => answerCall(call)}
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 animate-pulse"
                        disabled={activeCall !== null}
                      >
                        <Phone className="mr-2 h-5 w-5" />
                        Answer
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Calls Message */}
      {incomingCalls.length === 0 && !activeCall && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Phone className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Waiting for calls...</p>
            <p className="text-sm">New calls from mobile app will appear here instantly</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
