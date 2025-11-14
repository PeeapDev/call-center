'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

const mockCalls = [
  {
    id: '1',
    caller: '+232 76 123 456',
    agent: 'Sarah Johnson',
    duration: 142,
    status: 'active',
    queue: 'Technical Support',
    startTime: '12:45 PM',
  },
  {
    id: '2',
    caller: '+232 77 987 654',
    agent: 'Michael Chen',
    duration: 87,
    status: 'active',
    queue: 'General Inquiry',
    startTime: '12:48 PM',
  },
  {
    id: '3',
    caller: '+232 78 555 123',
    agent: null,
    duration: 34,
    status: 'waiting',
    queue: 'Student Services',
    startTime: '12:50 PM',
  },
  {
    id: '4',
    caller: '+232 79 321 789',
    agent: 'Emily Rodriguez',
    duration: 201,
    status: 'active',
    queue: 'Financial Aid',
    startTime: '12:42 PM',
  },
  {
    id: '5',
    caller: '+232 76 888 444',
    agent: null,
    duration: 12,
    status: 'waiting',
    queue: 'General Inquiry',
    startTime: '12:51 PM',
  },
];

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function CallsPage() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeCalls = mockCalls.filter((c) => c.status === 'active');
  const waitingCalls = mockCalls.filter((c) => c.status === 'waiting');

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
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">
              {mockCalls.length} active + 122 completed
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
