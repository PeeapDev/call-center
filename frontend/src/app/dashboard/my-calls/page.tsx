'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Phone,
  PhoneOutgoing,
  Clock,
  CheckCircle,
  XCircle,
  History,
  Play,
  PhoneCall,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AgentCallInterface from '@/components/AgentCallInterface';
import RealTimeCallNotifications from '@/components/RealTimeCallNotifications';
import { API_ENDPOINTS } from '@/lib/config';

interface CallHistory {
  id: string;
  callerNumber: string;
  callerName?: string;
  direction: 'inbound' | 'outbound';
  status: 'completed' | 'missed' | 'abandoned';
  duration: number;
  timestamp: Date;
  queue: string;
  notes?: string;
}

export default function MyCallsPage() {
  const [callHistory, setCallHistory] = useState<CallHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'active' | 'history'>('active');
  const [showDialer, setShowDialer] = useState(false);
  const [dialNumber, setDialNumber] = useState('');

  useEffect(() => {
    fetchCallHistory();
    const interval = setInterval(fetchCallHistory, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchCallHistory = async () => {
    try {
      // Get user phone from localStorage
      const userPhone = localStorage.getItem('userPhone');
      if (!userPhone) {
        setLoading(false);
        return;
      }

      // Fetch calls for this user
      const response = await fetch(`${API_ENDPOINTS.calls}?phone=${userPhone}`);
      const data = await response.json();
      
      if (data.status === 'ok' && data.calls) {
        setCallHistory(data.calls);
      }
    } catch (error) {
      console.error('Failed to fetch call history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCallback = (call: CallHistory) => {
    setDialNumber(call.callerNumber);
    setShowDialer(true);
  };

  const handleDial = () => {
    if (!dialNumber.trim()) {
      alert('Please enter a phone number');
      return;
    }
    alert(`Initiating call to ${dialNumber}`);
    // In production, this would trigger WebRTC call or route through Asterisk
    setShowDialer(false);
    setDialNumber('');
  };

  const addDigit = (digit: string) => {
    setDialNumber(dialNumber + digit);
  };

  const deleteDigit = () => {
    setDialNumber(dialNumber.slice(0, -1));
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    if (hours < 1) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else {
      return date.toLocaleString();
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Calls</h1>
            <p className="text-gray-500 mt-1">
              Manage your active calls and call history
            </p>
          </div>
          <Button 
            onClick={() => setShowDialer(true)}
            className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4" />
            Make a Call
          </Button>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setSelectedTab('active')}
          className={`px-6 py-3 font-medium transition-colors ${
            selectedTab === 'active'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Phone className="w-5 h-5 inline mr-2" />
          Active Calls
        </button>
        <button
          onClick={() => setSelectedTab('history')}
          className={`px-6 py-3 font-medium transition-colors ${
            selectedTab === 'history'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <History className="w-5 h-5 inline mr-2" />
          Call History
        </button>
      </div>

      {/* Active Calls Tab */}
      {selectedTab === 'active' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Real-Time Call Notifications with WebRTC */}
          <RealTimeCallNotifications />
          
          {/* Regular Call Interface */}
          <AgentCallInterface />
        </motion.div>
      )}

      {/* Call History Tab */}
      {selectedTab === 'history' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <CheckCircle className="w-8 h-8 mb-2" />
                <p className="text-3xl font-bold">
                  {callHistory.filter((c) => c.status === 'completed').length}
                </p>
                <p className="text-sm text-green-100">Completed Today</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
              <CardContent className="p-6">
                <XCircle className="w-8 h-8 mb-2" />
                <p className="text-3xl font-bold">
                  {callHistory.filter((c) => c.status === 'missed').length}
                </p>
                <p className="text-sm text-red-100">Missed Calls</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <Clock className="w-8 h-8 mb-2" />
                <p className="text-3xl font-bold">
                  {formatDuration(
                    callHistory
                      .filter((c) => c.status === 'completed')
                      .reduce((sum, c) => sum + c.duration, 0)
                  )}
                </p>
                <p className="text-sm text-blue-100">Total Talk Time</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <PhoneOutgoing className="w-8 h-8 mb-2" />
                <p className="text-3xl font-bold">
                  {callHistory.filter((c) => c.direction === 'outbound').length}
                </p>
                <p className="text-sm text-purple-100">Callbacks Made</p>
              </CardContent>
            </Card>
          </div>

          {/* Call History List */}
          {callHistory.map((call, idx) => (
            <motion.div
              key={call.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              whileHover={{ scale: 1.01, x: 5 }}
            >
              <Card
                className={`border-l-4 ${
                  call.status === 'completed'
                    ? 'border-l-green-500'
                    : call.status === 'missed'
                      ? 'border-l-red-500'
                      : 'border-l-orange-500'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {call.direction === 'inbound' ? (
                          <Phone className="w-5 h-5 text-blue-600" />
                        ) : (
                          <PhoneOutgoing className="w-5 h-5 text-purple-600" />
                        )}
                        <h3 className="text-lg font-bold text-gray-900">
                          {call.callerName || call.callerNumber}
                        </h3>
                        {!call.callerName && (
                          <span className="text-gray-600">{call.callerNumber}</span>
                        )}
                        <Badge
                          variant={
                            call.status === 'completed'
                              ? 'default'
                              : call.status === 'missed'
                                ? 'destructive'
                                : 'secondary'
                          }
                          className={
                            call.status === 'completed'
                              ? 'bg-green-500'
                              : call.status === 'missed'
                                ? 'bg-red-500'
                                : 'bg-orange-500'
                          }
                        >
                          {call.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-sm text-gray-600">
                        <div>
                          <strong>Queue:</strong> {call.queue}
                        </div>
                        <div>
                          <strong>Duration:</strong> {formatDuration(call.duration)}
                        </div>
                        <div>
                          <strong>Time:</strong> {formatTimestamp(call.timestamp)}
                        </div>
                      </div>

                      {call.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                          <strong>Notes:</strong> {call.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {(call.status === 'missed' || call.status === 'abandoned') && (
                        <Button
                          onClick={() => handleCallback(call)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <PhoneOutgoing className="w-4 h-4 mr-2" />
                          Call Back
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Play className="w-4 h-4 mr-1" />
                        Listen
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Dialer Modal */}
      {showDialer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="w-full max-w-md shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-green-600" />
                  Make a Call
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDialer(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Number Display */}
                <div className="p-4 bg-gray-100 rounded-lg text-center">
                  <input
                    type="text"
                    value={dialNumber}
                    onChange={(e) => setDialNumber(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full text-center text-2xl font-mono bg-transparent border-none outline-none"
                  />
                </div>

                {/* Dialpad */}
                <div className="grid grid-cols-3 gap-3">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                    <Button
                      key={digit}
                      onClick={() => addDigit(digit)}
                      variant="outline"
                      className="h-16 text-xl font-semibold hover:bg-green-50"
                    >
                      {digit}
                    </Button>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={deleteDigit}
                    className="h-12"
                  >
                    Delete
                  </Button>
                  <Button
                    onClick={handleDial}
                    className="h-12 bg-green-600 hover:bg-green-700"
                  >
                    <PhoneCall className="w-5 h-5 mr-2" />
                    Call
                  </Button>
                </div>

                {/* Quick Dial Suggestions */}
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Recent Contacts:</p>
                  <div className="space-y-2">
                    {callHistory.slice(0, 3).map((call) => (
                      <button
                        key={call.id}
                        onClick={() => setDialNumber(call.callerNumber)}
                        className="w-full p-2 text-left hover:bg-gray-50 rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-sm">{call.callerName || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{call.callerNumber}</p>
                        </div>
                        <PhoneOutgoing className="w-4 h-4 text-green-600" />
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
