'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileAudio, Download, Play, Search } from 'lucide-react';
import { useState } from 'react';

const mockRecordings = [
  {
    id: '1',
    caller: '+232 76 123 456',
    agent: 'Sarah Johnson',
    date: '2025-11-14',
    time: '10:23 AM',
    duration: '4:32',
    size: '2.1 MB',
    queue: 'Technical Support',
    status: 'completed',
  },
  {
    id: '2',
    caller: '+232 77 987 654',
    agent: 'Michael Chen',
    date: '2025-11-14',
    time: '10:18 AM',
    duration: '6:45',
    size: '3.2 MB',
    queue: 'General Inquiry',
    status: 'completed',
  },
  {
    id: '3',
    caller: '+232 78 555 123',
    agent: 'Emily Rodriguez',
    date: '2025-11-14',
    time: '10:05 AM',
    duration: '3:12',
    size: '1.5 MB',
    queue: 'Student Services',
    status: 'completed',
  },
  {
    id: '4',
    caller: '+232 79 321 789',
    agent: 'David Kim',
    date: '2025-11-14',
    time: '09:54 AM',
    duration: '8:23',
    size: '4.0 MB',
    queue: 'Financial Aid',
    status: 'completed',
  },
  {
    id: '5',
    caller: '+232 76 888 444',
    agent: 'Lisa Thompson',
    date: '2025-11-14',
    time: '09:42 AM',
    duration: '2:56',
    size: '1.4 MB',
    queue: 'General Inquiry',
    status: 'completed',
  },
  {
    id: '6',
    caller: '+232 77 111 222',
    agent: 'James Wilson',
    date: '2025-11-14',
    time: '09:30 AM',
    duration: '5:18',
    size: '2.5 MB',
    queue: 'Technical Support',
    status: 'transcribed',
  },
];

export default function RecordingsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecordings = mockRecordings.filter(
    (rec) =>
      rec.caller.includes(searchQuery) ||
      rec.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.queue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Call Recordings</h1>
          <p className="text-gray-500 mt-1">
            Listen, download, and analyze recorded calls
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recordings</CardTitle>
            <FileAudio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockRecordings.length}</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
            <FileAudio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">31:06</div>
            <p className="text-xs text-muted-foreground">Hours of audio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <FileAudio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14.7 MB</div>
            <p className="text-xs text-muted-foreground">Of 10 GB available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transcribed</CardTitle>
            <FileAudio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockRecordings.filter((r) => r.status === 'transcribed').length}
            </div>
            <p className="text-xs text-muted-foreground">AI processed</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by caller, agent, or queue..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Recordings List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Recordings ({filteredRecordings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredRecordings.map((recording) => (
              <div
                key={recording.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <FileAudio className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-gray-900">
                        {recording.caller}
                      </p>
                      <Badge variant="outline">{recording.queue}</Badge>
                      {recording.status === 'transcribed' && (
                        <Badge className="bg-green-500">Transcribed</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Agent: {recording.agent} • {recording.date} at {recording.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {recording.duration}
                    </p>
                    <p className="text-xs text-gray-500">{recording.size}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Play className="w-4 h-4 mr-1" />
                      Play
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {filteredRecordings.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No recordings found matching your search.
        </div>
      )}
    </div>
  );
}
