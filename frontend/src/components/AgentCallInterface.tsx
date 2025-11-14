'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Phone,
  PhoneOff,
  PhoneCall,
  Pause,
  Play,
  PhoneForwarded,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  User,
  Clock,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Call {
  id: string;
  callerNumber: string;
  callerName?: string;
  queue: string;
  waitTime: number;
  callType: string;
  priority: 'normal' | 'high' | 'urgent';
}

interface ActiveCall extends Call {
  startTime: Date;
  duration: number;
  status: 'ringing' | 'connected' | 'on-hold';
  muted: boolean;
  speakerOn: boolean;
  notes: string;
}

export default function AgentCallInterface() {
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [notes, setNotes] = useState('');

  // Simulate incoming call
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!incomingCall && !activeCall) {
        setIncomingCall({
          id: Math.random().toString(36).substr(2, 9),
          callerNumber: '+232 76 ' + Math.floor(Math.random() * 1000000),
          callerName: ['John Doe', 'Sarah Johnson', 'Ministry Official'][
            Math.floor(Math.random() * 3)
          ],
          queue: 'Exam Malpractice Queue',
          waitTime: Math.floor(Math.random() * 120),
          callType: ['Exam Complaint', 'Teacher Issue', 'School Facility'][
            Math.floor(Math.random() * 3)
          ],
          priority: (['normal', 'high', 'urgent'] as const)[Math.floor(Math.random() * 3)],
        });
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [incomingCall, activeCall]);

  // Update call duration
  useEffect(() => {
    if (activeCall && activeCall.status === 'connected') {
      const interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeCall]);

  const handleAnswerCall = () => {
    if (incomingCall) {
      setActiveCall({
        ...incomingCall,
        startTime: new Date(),
        duration: 0,
        status: 'connected',
        muted: false,
        speakerOn: false,
        notes: '',
      });
      setIncomingCall(null);
      setCallDuration(0);
    }
  };

  const handleEndCall = () => {
    setActiveCall(null);
    setCallDuration(0);
    setNotes('');
  };

  const handleHoldCall = () => {
    if (activeCall) {
      setActiveCall({
        ...activeCall,
        status: activeCall.status === 'on-hold' ? 'connected' : 'on-hold',
      });
    }
  };

  const handleMuteToggle = () => {
    if (activeCall) {
      setActiveCall({
        ...activeCall,
        muted: !activeCall.muted,
      });
    }
  };

  const handleSpeakerToggle = () => {
    if (activeCall) {
      setActiveCall({
        ...activeCall,
        speakerOn: !activeCall.speakerOn,
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Incoming Call Alert */}
      <AnimatePresence>
        {incomingCall && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-4 border-green-500 bg-green-50 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600">
                <CardTitle className="flex items-center gap-3 text-white">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <PhoneCall className="w-8 h-8" />
                  </motion.div>
                  Incoming Call
                  {incomingCall.priority !== 'normal' && (
                    <Badge
                      variant="destructive"
                      className={
                        incomingCall.priority === 'urgent'
                          ? 'bg-red-600 animate-pulse'
                          : 'bg-orange-600'
                      }
                    >
                      {incomingCall.priority.toUpperCase()}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Caller</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {incomingCall.callerName || 'Unknown'}
                    </p>
                    <p className="text-lg text-gray-600">{incomingCall.callerNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Queue</p>
                    <p className="font-semibold text-gray-900">{incomingCall.queue}</p>
                    <p className="text-sm text-gray-600 mt-2">Type: {incomingCall.callType}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-gray-700">
                    Waiting: <strong>{incomingCall.waitTime}s</strong>
                  </span>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleAnswerCall}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-lg py-6"
                    size="lg"
                  >
                    <Phone className="w-6 h-6 mr-2" />
                    Answer Call
                  </Button>
                  <Button
                    onClick={() => setIncomingCall(null)}
                    variant="outline"
                    className="px-6 border-red-500 text-red-600 hover:bg-red-50"
                    size="lg"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Call Interface */}
      {activeCall && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-blue-500 shadow-2xl">
            <CardHeader
              className={`${
                activeCall.status === 'on-hold'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600'
              }`}
            >
              <CardTitle className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <User className="w-6 h-6" />
                  <div>
                    <p className="text-xl">
                      {activeCall.callerName || 'Unknown Caller'}
                    </p>
                    <p className="text-sm text-blue-100">{activeCall.callerNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-white text-blue-600 text-lg px-4 py-2">
                    <Clock className="w-4 h-4 mr-2" />
                    {formatDuration(callDuration)}
                  </Badge>
                  <Badge
                    className={
                      activeCall.status === 'on-hold'
                        ? 'bg-orange-200 text-orange-800'
                        : 'bg-green-200 text-green-800'
                    }
                  >
                    {activeCall.status === 'on-hold' ? 'ON HOLD' : 'CONNECTED'}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Call Info */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Queue</p>
                  <p className="font-semibold">{activeCall.queue}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Call Type</p>
                  <p className="font-semibold">{activeCall.callType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Start Time</p>
                  <p className="font-semibold">
                    {activeCall.startTime.toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Call Controls */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  onClick={handleMuteToggle}
                  variant={activeCall.muted ? 'default' : 'outline'}
                  className={`${
                    activeCall.muted ? 'bg-red-500 hover:bg-red-600 text-white' : ''
                  }`}
                  size="lg"
                >
                  {activeCall.muted ? (
                    <MicOff className="w-5 h-5 mr-2" />
                  ) : (
                    <Mic className="w-5 h-5 mr-2" />
                  )}
                  {activeCall.muted ? 'Unmute' : 'Mute'}
                </Button>

                <Button
                  onClick={handleSpeakerToggle}
                  variant={activeCall.speakerOn ? 'default' : 'outline'}
                  className={`${
                    activeCall.speakerOn ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''
                  }`}
                  size="lg"
                >
                  {activeCall.speakerOn ? (
                    <Volume2 className="w-5 h-5 mr-2" />
                  ) : (
                    <VolumeX className="w-5 h-5 mr-2" />
                  )}
                  Speaker
                </Button>

                <Button
                  onClick={handleHoldCall}
                  variant="outline"
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  size="lg"
                >
                  {activeCall.status === 'on-hold' ? (
                    <Play className="w-5 h-5 mr-2" />
                  ) : (
                    <Pause className="w-5 h-5 mr-2" />
                  )}
                  {activeCall.status === 'on-hold' ? 'Resume' : 'Hold'}
                </Button>

                <Button
                  variant="outline"
                  className="border-purple-500 text-purple-600 hover:bg-purple-50"
                  size="lg"
                >
                  <PhoneForwarded className="w-5 h-5 mr-2" />
                  Transfer
                </Button>
              </div>

              {/* Call Notes */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Call Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter call notes here..."
                  className="w-full h-24 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* End Call Button */}
              <Button
                onClick={handleEndCall}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-6"
                size="lg"
              >
                <PhoneOff className="w-6 h-6 mr-2" />
                End Call
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* No Active Call State */}
      {!incomingCall && !activeCall && (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-12 text-center">
            <Phone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Ready for Calls</h3>
            <p className="text-gray-500">
              Waiting for incoming calls... You'll be notified when a call arrives.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
