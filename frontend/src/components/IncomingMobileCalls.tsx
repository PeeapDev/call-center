'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Clock, User, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileCall {
  id: string;
  phoneNumber: string;
  callerName: string;
  ivrOption: string;
  queueName: string;
  status: string;
  createdAt: string;
  assignedAgentName?: string;
}

export default function IncomingMobileCalls() {
  const [incomingCalls, setIncomingCalls] = useState<MobileCall[]>([]);
  const [loading, setLoading] = useState(false);
  const [claimingCallId, setClaimingCallId] = useState<string | null>(null);

  const fetchIncomingCalls = async () => {
    try {
      const response = await fetch('http://localhost:3001/calls/active/waiting');
      if (response.ok) {
        const calls = await response.json();
        setIncomingCalls(calls);
      }
    } catch (error) {
      console.error('Failed to fetch incoming calls:', error);
    }
  };

  useEffect(() => {
    fetchIncomingCalls();
    
    // Poll every 3 seconds for new calls
    const interval = setInterval(() => {
      fetchIncomingCalls();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleClaimCall = async (callId: string) => {
    setClaimingCallId(callId);
    try {
      // Get agent name from session/auth (for now use mock)
      const agentName = 'Dashboard Agent';
      const agentExtension = '2000';

      const response = await fetch(`http://localhost:3001/calls/${callId}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentName,
          agentExtension,
        }),
      });

      if (response.ok) {
        // Remove from list
        setIncomingCalls(calls => calls.filter(c => c.id !== callId));
        alert('Call claimed! You can now answer it.');
      } else {
        alert('Failed to claim call');
      }
    } catch (error) {
      console.error('Failed to claim call:', error);
      alert('Failed to claim call');
    } finally {
      setClaimingCallId(null);
    }
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

  const getTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-green-600" />
            Incoming Mobile Calls
            {incomingCalls.length > 0 && (
              <Badge variant="destructive" className="ml-2 animate-pulse">
                {incomingCalls.length} waiting
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchIncomingCalls}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {incomingCalls.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Phone className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No incoming calls from mobile app</p>
            <p className="text-sm">New calls will appear here automatically</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {incomingCalls.map((call) => (
                <motion.div
                  key={call.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-blue-50 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                          <Phone className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-lg">{call.callerName}</div>
                          <div className="text-sm text-gray-600">{call.phoneNumber}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Hash className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{getIVRLabel(call.ivrOption)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-orange-600" />
                          <span>{getTimeAgo(call.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {call.queueName}
                        </Badge>
                        {call.assignedAgentName && (
                          <Badge variant="secondary" className="text-xs">
                            <User className="h-3 w-3 mr-1" />
                            {call.assignedAgentName}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => handleClaimCall(call.id)}
                      disabled={claimingCallId === call.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {claimingCallId === call.id ? (
                        <>
                          <Clock className="mr-2 h-4 w-4 animate-spin" />
                          Claiming...
                        </>
                      ) : (
                        <>
                          <Phone className="mr-2 h-4 w-4" />
                          Answer Call
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
