'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneIncoming, PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { WebRTCClient } from '@/lib/webrtc-client';

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
        agentId: 'agent_dashboard_' + Date.now(),
        agentName: 'Dashboard Agent',
        extension: '2000',
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

  const answerCall = async (call: IncomingCall) => {
    try {
      console.log('📞 Answering call:', call.callId);

      // Notify backend that agent accepted the call
      if (socket) {
        const response = await new Promise((resolve) => {
          socket.emit('call:accept', { callId: call.callId }, resolve);
        });
        console.log('Backend response:', response);
      }

      // Initialize WebRTC if not already done
      if (!webrtcClient) {
        const client = new WebRTCClient({
          wsServer: 'wss://localhost:8089/ws', // Asterisk WebSocket
          sipUri: 'sip:2000@localhost',
          password: 'agent_password',
          displayName: 'Dashboard Agent',
        });

        try {
          await client.register();
          setWebrtcClient(client);
          console.log('✅ WebRTC client registered');
        } catch (error) {
          console.error('❌ WebRTC registration failed:', error);
          alert('WebRTC connection failed. Make sure Asterisk is running.');
          return;
        }
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

      // In a real implementation, you would:
      // 1. Establish WebRTC connection with the mobile user
      // 2. Or bridge the call through Asterisk
      // For now, we simulate the connection
      
      alert(`Call connected with ${call.callerName}!\n\nWebRTC connection would be established here.`);

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
