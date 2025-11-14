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
} from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import AgentCallInterface from '@/components/AgentCallInterface';

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

const mockCallHistory: CallHistory[] = [
  {
    id: '1',
    callerNumber: '+232 76 123 456',
    callerName: 'John Kamara',
    direction: 'inbound',
    status: 'completed',
    duration: 342,
    timestamp: new Date(Date.now() - 3600000),
    queue: 'Exam Malpractice',
    notes: 'Reported cheating at XYZ School. Opened investigation case #1234.',
  },
  {
    id: '2',
    callerNumber: '+232 77 987 654',
    callerName: 'Sarah Johnson',
    direction: 'inbound',
    status: 'missed',
    duration: 0,
    timestamp: new Date(Date.now() - 7200000),
    queue: 'Teacher Complaints',
  },
  {
    id: '3',
    callerNumber: '+232 78 555 123',
    direction: 'outbound',
    status: 'completed',
    duration: 180,
    timestamp: new Date(Date.now() - 10800000),
    queue: 'Follow-up',
    notes: 'Callback - Provided update on investigation status.',
  },
  {
    id: '4',
    callerNumber: '+232 76 444 222',
    callerName: 'Mohamed Sesay',
    direction: 'inbound',
    status: 'abandoned',
    duration: 45,
    timestamp: new Date(Date.now() - 14400000),
    queue: 'General Inquiry',
  },
];

export default function MyCallsPage() {
  const [callHistory] = useState<CallHistory[]>(mockCallHistory);
  const [selectedTab, setSelectedTab] = useState<'active' | 'history'>('active');

  const handleCallback = (call: CallHistory) => {
    alert(`Initiating callback to ${call.callerNumber}`);
    // In production, this would trigger WebRTC call or route through Asterisk
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
        <h1 className="text-3xl font-bold text-gray-900">My Calls</h1>
        <p className="text-gray-500 mt-1">
          Manage your active calls and call history
        </p>
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
        >
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
    </div>
  );
}
