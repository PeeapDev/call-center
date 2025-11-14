'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Phone, Clock, TrendingUp } from 'lucide-react';

const mockAgents = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@education.gov',
    status: 'on-call',
    currentCall: '+232 76 123 456',
    callDuration: '2:34',
    callsToday: 12,
    avgCallTime: '4:23',
    extension: '1001',
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@education.gov',
    status: 'on-call',
    currentCall: '+232 77 987 654',
    callDuration: '1:45',
    callsToday: 9,
    avgCallTime: '3:56',
    extension: '1002',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@education.gov',
    status: 'available',
    currentCall: null,
    callDuration: null,
    callsToday: 11,
    avgCallTime: '5:12',
    extension: '1003',
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.kim@education.gov',
    status: 'break',
    currentCall: null,
    callDuration: null,
    callsToday: 8,
    avgCallTime: '4:45',
    extension: '1004',
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    email: 'lisa.thompson@education.gov',
    status: 'offline',
    currentCall: null,
    callDuration: null,
    callsToday: 0,
    avgCallTime: 'N/A',
    extension: '1005',
  },
  {
    id: '6',
    name: 'James Wilson',
    email: 'james.wilson@education.gov',
    status: 'available',
    currentCall: null,
    callDuration: null,
    callsToday: 7,
    avgCallTime: '3:34',
    extension: '1006',
  },
];

export default function AgentsPage() {
  const onlineAgents = mockAgents.filter((a) => a.status !== 'offline');
  const onCallAgents = mockAgents.filter((a) => a.status === 'on-call');
  const availableAgents = mockAgents.filter((a) => a.status === 'available');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agents</h1>
          <p className="text-gray-500 mt-1">Manage and monitor call center agents</p>
        </div>
        <Button>Add Agent</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAgents.length}</div>
            <p className="text-xs text-muted-foreground">
              {onlineAgents.length} online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Call</CardTitle>
            <Phone className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {onCallAgents.length}
            </div>
            <p className="text-xs text-muted-foreground">Currently handling calls</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {availableAgents.length}
            </div>
            <p className="text-xs text-muted-foreground">Ready for calls</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4:12</div>
            <p className="text-xs text-muted-foreground">Avg call duration</p>
          </CardContent>
        </Card>
      </div>

      {/* Agents List */}
      <Card>
        <CardHeader>
          <CardTitle>All Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAgents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                    {agent.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-gray-900">{agent.name}</p>
                      <Badge
                        variant={
                          agent.status === 'on-call'
                            ? 'default'
                            : agent.status === 'available'
                              ? 'secondary'
                              : 'outline'
                        }
                        className={
                          agent.status === 'on-call'
                            ? 'bg-green-500'
                            : agent.status === 'available'
                              ? 'bg-blue-500'
                              : ''
                        }
                      >
                        {agent.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{agent.email}</p>
                    {agent.currentCall && (
                      <p className="text-sm text-green-600 font-medium mt-1">
                        📞 On call with {agent.currentCall} • {agent.callDuration}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {agent.callsToday}
                    </p>
                    <p className="text-xs text-gray-500">Calls today</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">
                      {agent.avgCallTime}
                    </p>
                    <p className="text-xs text-gray-500">Avg duration</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">
                      Ext {agent.extension}
                    </p>
                    <p className="text-xs text-gray-500">Extension</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
