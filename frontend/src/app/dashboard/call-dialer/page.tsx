'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneCall, Delete, PhoneOff, Volume2, Mic, MicOff, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { buildApiUrl } from '@/lib/config';

export default function CallDialerPage() {
  const { data: session } = useSession();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<'idle' | 'dialing' | 'connected' | 'ended'>('idle');
  const [ivrStage, setIvrStage] = useState<'idle' | 'menu' | 'routed'>('idle');
  const [queueMessage, setQueueMessage] = useState<string | null>(null);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);

  const quickDial = [
    { number: '117', label: 'Ministry Hotline', icon: '📞' },
    { number: '112', label: 'Emergency', icon: '🚨' },
    { number: '113', label: 'Support', icon: '💬' },
  ];

  const recentCalls = [
    { number: '117', time: '2 hours ago', duration: '5:23', type: 'outgoing' },
    { number: '117', time: 'Yesterday', duration: '3:45', type: 'outgoing' },
  ];

  const handleNumberClick = (num: string) => {
    if (!isCallActive) {
      setPhoneNumber(phoneNumber + num);
    }
  };

  const handleDelete = () => {
    setPhoneNumber(phoneNumber.slice(0, -1));
  };

  const handleCall = async () => {
    if (!phoneNumber) return;

    setCallStatus('dialing');
    setIsCallActive(true);
    setIvrStage('menu');
    setQueueMessage(null);
    setQueuePosition(null);
  };

  const handleIvrChoice = async (option: '1' | '2' | '3' | '4' | '9') => {
    try {
      const user = session?.user as any;
      const res = await fetch(buildApiUrl('/calls/initiate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          ivrOption: option,
          callerName: user?.name || 'Guest User',
          userId: user?.id || undefined,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setQueueMessage(data.message);
        setQueuePosition(data.queuePosition || null);
        setCallStatus('connected');
        setIvrStage('routed');

        const interval = setInterval(() => {
          setCallDuration((prev) => prev + 1);
        }, 1000);
        (window as any).callInterval = interval;
      } else {
        setQueueMessage(data.message || 'Failed to route call');
        setCallStatus('ended');
      }
    } catch (error) {
      console.error('Failed to initiate call via IVR:', error);
      setQueueMessage('Failed to connect call. Please try again.');
      setCallStatus('ended');
    }
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    if ((window as any).callInterval) {
      clearInterval((window as any).callInterval);
    }

    setTimeout(() => {
      setIsCallActive(false);
      setCallStatus('idle');
      setCallDuration(0);
      setPhoneNumber('');
      setIsMuted(false);
      setIvrStage('idle');
      setQueueMessage(null);
      setQueuePosition(null);
    }, 1000);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Phone className="w-7 h-7 text-blue-600" />
          Call Dialer
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Make calls to the Ministry hotline and support services
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dialer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Dialer Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardTitle>Phone Dialer</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Display */}
                <div className="mb-6">
                  <div className="bg-gray-50 rounded-lg p-6 min-h-[80px] flex items-center justify-center">
                    <input
                      type="text"
                      value={phoneNumber}
                      readOnly
                      placeholder="Enter number"
                      className="bg-transparent text-3xl font-mono text-center w-full focus:outline-none"
                    />
                  </div>
                  
                  {isCallActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 text-center"
                    >
                      <Badge
                        className={
                          callStatus === 'dialing' ? 'bg-orange-100 text-orange-700' :
                          callStatus === 'connected' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }
                      >
                        {callStatus === 'dialing' ? 'Dialing...' :
                         callStatus === 'connected' ? `Connected - ${formatDuration(callDuration)}` :
                         'Call Ended'}
                      </Badge>
                      {queueMessage && (
                        <p className="mt-2 text-xs text-gray-500">
                          {queueMessage}
                          {queuePosition ? ` • Queue position: ${queuePosition}` : ''}
                        </p>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Keypad or IVR Menu */}
                {!isCallActive ? (
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((num, index) => (
                      <motion.button
                        key={num}
                        onClick={() => handleNumberClick(num.toString())}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="h-16 rounded-lg bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-xl font-semibold text-gray-700"
                      >
                        {num}
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <>
                    {ivrStage === 'menu' ? (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600 text-center">
                          IVR Menu (web simulation):
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handleIvrChoice('1')}
                          >
                            Press 1
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleIvrChoice('2')}
                          >
                            Press 2
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleIvrChoice('3')}
                          >
                            Press 3
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleIvrChoice('4')}
                          >
                            Press 4
                          </Button>
                          <Button
                            variant="outline"
                            className="border-red-500 text-red-600"
                            onClick={() => handleIvrChoice('9')}
                          >
                            Press 9 (Urgent)
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                          In a real phone call, these would be DTMF key presses. Here we simulate the IVR flow on the web.
                        </p>
                      </div>
                    ) : (
                      <div className="flex justify-center gap-4">
                        <Button
                          onClick={() => setIsMuted(!isMuted)}
                          variant="outline"
                          size="lg"
                          className="w-20 h-20 rounded-full"
                        >
                          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-20 h-20 rounded-full"
                        >
                          <Volume2 className="w-6 h-6" />
                        </Button>
                      </div>
                    )}
                  </>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex gap-3">
                  {!isCallActive ? (
                    <>
                      <Button
                        onClick={handleDelete}
                        variant="outline"
                        className="flex-1 h-14"
                        disabled={!phoneNumber}
                      >
                        <Delete className="w-5 h-5" />
                      </Button>
                      <Button
                        onClick={handleCall}
                        className="flex-1 h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        disabled={!phoneNumber}
                      >
                        <PhoneCall className="w-5 h-5 mr-2" />
                        Call
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleEndCall}
                      className="w-full h-14 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                    >
                      <PhoneOff className="w-5 h-5 mr-2" />
                      End Call
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Calls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Calls
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {recentCalls.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">No recent calls</p>
                ) : (
                  <div className="space-y-3">
                    {recentCalls.map((call, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Phone className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{call.number}</p>
                            <p className="text-sm text-gray-500">{call.time} • {call.duration}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => setPhoneNumber(call.number)}
                          variant="ghost"
                          size="sm"
                        >
                          <PhoneCall className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Dial */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle>Quick Dial</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {quickDial.map((contact, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    setPhoneNumber(contact.number);
                    if (!isCallActive) {
                      setTimeout(handleCall, 300);
                    }
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-4 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                  disabled={isCallActive}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{contact.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{contact.label}</p>
                      <p className="text-sm text-gray-600">{contact.number}</p>
                    </div>
                  </div>
                </motion.button>
              ))}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Calls are free from within the portal. For mobile calls, standard rates apply.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
