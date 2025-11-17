'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneIncoming, PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { WebRTCClient } from '@/lib/webrtc-client';
import { API_ENDPOINTS } from '@/lib/config';

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

export default function RealTimeCallNotifications() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [incomingCalls, setIncomingCalls] = useState<IncomingCall[]>([]);
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [webrtcClient, setWebrtcClient] = useState<WebRTCClient | null>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const socketInstance = io('http://localhost:3001/calls', {
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('✅ Connected to call server');
      setIsConnected(true);
      setSocket(socketInstance);

      // Register as agent
      socketInstance.emit('agent:register', {
        agentId: 'agent_webrtc_1001',
        agentName: 'WebRTC Agent 1001',
        extension: '1001',
      });
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Disconnected from call server');
      setIsConnected(false);
    });

    socketInstance.on('agent:registered', (data) => {
      console.log('✅ Agent registered:', data);
    });

    // Listen for incoming calls
    socketInstance.on('call:incoming', (call: IncomingCall) => {
      console.log('📞 INCOMING CALL:', call);
      
      // Play notification sound
      playNotificationSound();
      
      // Add to incoming calls list
      setIncomingCalls((prev) => {
        // Prevent duplicates
        if (prev.some(c => c.callId === call.callId)) {
          return prev;
        }
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
  }, []);

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

  // Auto-answer incoming SIP calls from Asterisk once WebRTC client is registered
  useEffect(() => {
    if (!webrtcClient) return;

    const handleIncomingCall = (event: any) => {
      try {
        console.log('🎧 Incoming SIP call for agent:', event.detail);
        webrtcClient.answerCall();
      } catch (err) {
        console.error('Failed to auto-answer SIP call:', err);
      }
    };

    window.addEventListener('incoming-call', handleIncomingCall as any);
    return () => {
      window.removeEventListener('incoming-call', handleIncomingCall as any);
    };
  }, [webrtcClient]);

  const playNotificationSound = () => {
    // Create a loud ring pattern to alert agents
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Play 3 beeps with increasing volume
    for (let i = 0; i < 3; i++) {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 880; // Higher pitch for attention
      oscillator.type = 'sine';
      
      const startTime = audioContext.currentTime + (i * 0.5);
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.6, startTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, startTime + 0.3);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    }
  };

  const answerCall = async (call: IncomingCall) => {
    try {
      console.log('📞 Answering call:', call.callId);
      const agentExtension = '1001';
      const agentName = 'WebRTC Agent 1001';

      // Ensure WebRTC client is registered with Asterisk for this agent extension
      let client = webrtcClient;
      if (!client) {
        client = new WebRTCClient({
          wsServer: 'ws://localhost:8088/ws', // Asterisk WebSocket (ws)
          sipUri: `sip:${agentExtension}@localhost`,
          password: 'password1001',
          displayName: agentName,
        });

        try {
          await client.register();
          setWebrtcClient(client);
          console.log('✅ WebRTC client registered for', agentExtension);
        } catch (error) {
          console.error('❌ WebRTC registration failed:', error);
          alert('WebRTC connection failed. Make sure Asterisk is running.');
          return;
        }
      }

      // Tell backend to claim and bridge this call to the agent's PJSIP endpoint
      try {
        const claimResponse = await fetch(`${API_ENDPOINTS.calls}/${call.callId}/claim`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentName,
            agentExtension,
          }),
        });
        const claimData = await claimResponse.json();
        console.log('Claim response:', claimData);
      } catch (err) {
        console.error('Failed to claim/bridge call:', err);
      }

      // Also notify gateway via WebSocket so other agents see that the call was taken
      if (socket) {
        socket.emit('call:accept', { callId: call.callId }, (response: any) => {
          console.log('Gateway accept response:', response);
        });
      }

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

    } catch (error) {
      console.error('Failed to answer call:', error);
      alert('Failed to answer call');
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
      if (webrtcClient) {
        webrtcClient.hangup();
      }

      // End call in backend database
      await fetch(`http://localhost:3001/calls/${activeCall.callId}/end`, {
        method: 'POST',
      });

      setActiveCall(null);
      console.log('📴 Call ended');
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  const toggleMute = () => {
    if (!activeCall) return;
    
    if (webrtcClient) {
      const isMuted = webrtcClient.toggleMute();
      setActiveCall((prev) => prev ? { ...prev, isMuted } : null);
    }
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
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        <span className="text-sm font-medium">
          {isConnected ? '🟢 Connected - Ready for calls' : '🔴 Disconnected'}
        </span>
      </div>

      {/* Active Call */}
      {activeCall && (
        <Card className="border-2 border-green-500 shadow-lg">
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-green-600 animate-pulse" />
                <span>Active Call</span>
              </div>
              <Badge variant="default" className="text-lg">
                {formatDuration(activeCall.duration)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <div className="text-2xl font-bold">{activeCall.callerName}</div>
                <div className="text-gray-600">{activeCall.phoneNumber}</div>
              </div>

              <div className="flex gap-2 justify-center">
                <Button
                  onClick={toggleMute}
                  variant={activeCall.isMuted ? 'destructive' : 'outline'}
                  size="lg"
                >
                  {activeCall.isMuted ? <MicOff className="mr-2 h-5 w-5" /> : <Mic className="mr-2 h-5 w-5" />}
                  {activeCall.isMuted ? 'Unmute' : 'Mute'}
                </Button>

                <Button onClick={endCall} variant="destructive" size="lg">
                  <PhoneOff className="mr-2 h-5 w-5" />
                  End Call
                </Button>
              </div>
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
