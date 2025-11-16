'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { buildApiUrl } from '@/lib/config';

interface Call {
  id: string;
  caller: string;
  agent: string | null;
  duration: number;
  status: 'active' | 'waiting';
  queue: string;
  startTime: string;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function CallsPage() {
  const [time, setTime] = useState(0);
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchActiveCalls();
    // Poll every 3 seconds for real-time updates
    const pollInterval = setInterval(fetchActiveCalls, 3000);
    return () => clearInterval(pollInterval);
  }, []);

  const fetchActiveCalls = async () => {
    try {
      const response = await fetch(buildApiUrl('/calls/active'));
      const data = await response.json();
      
      if (data.status === 'ok') {
        setCalls(data.calls || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch active calls:', error);
      setCalls([]); // Clear calls on error
      setLoading(false);
    }
  };

  const activeCalls = calls.filter((c) => c.status === 'active');
  const waitingCalls = calls.filter((c) => c.status === 'waiting');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Active Calls</h1>
        <p className="text-gray-500 mt-1">
          Real-time call monitoring and management
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Calls</CardTitle>
            <Phone className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeCalls.length}
            </div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waiting</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {waitingCalls.length}
            </div>
            <p className="text-xs text-muted-foreground">In queue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Today</CardTitle>
            <PhoneOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calls.length}</div>
            <p className="text-xs text-muted-foreground">
              Real-time call tracking
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Calls */}
      <Card>
        <CardHeader>
          <CardTitle>Active Calls ({activeCalls.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading calls...
            </div>
          ) : activeCalls.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Phone className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No active calls at the moment</p>
              <p className="text-sm mt-2">Calls will appear here when citizens contact the center</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeCalls.map((call) => (
              <div
                key={call.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-gray-900">{call.caller}</p>
                      <Badge variant="outline">{call.queue}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Agent: {call.agent} • Started at {call.startTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {formatDuration(call.duration + time)}
                    </p>
                    <p className="text-xs text-gray-500">Duration</p>
                  </div>
                  <Button variant="destructive" size="sm">
                    <PhoneOff className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Waiting Calls */}
      {waitingCalls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Waiting in Queue ({waitingCalls.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {waitingCalls.map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50 border-yellow-200"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-gray-900">{call.caller}</p>
                        <Badge variant="outline">{call.queue}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Waiting for agent • Joined at {call.startTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-yellow-600">
                        {formatDuration(call.duration + time)}
                      </p>
                      <p className="text-xs text-gray-500">Wait time</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Assign
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
