'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileAudio, Download, Play, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/lib/config';

interface Recording {
  id: string;
  callId: string;
  caller: string;
  agent?: string;
  startTime: string;
  endTime: string;
  duration: number;
  recordingUrl?: string;
  fileSize?: number;
  queue?: string;
  status: string;
}

export default function RecordingsPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    totalDuration: 0,
    totalSize: 0,
    transcribed: 0,
  });

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINTS.calls}/recordings`);
      const data = await response.json();

      if (data.status === 'ok' && data.recordings) {
        setRecordings(data.recordings);
        calculateStats(data.recordings);
      }
    } catch (error) {
      console.error('Failed to fetch recordings:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (recs: Recording[]) => {
    const total = recs.length;
    const totalDuration = recs.reduce((sum, r) => sum + (r.duration || 0), 0);
    const totalSize = recs.reduce((sum, r) => sum + (r.fileSize || 0), 0);
    const transcribed = recs.filter((r) => r.status === 'transcribed').length;

    setStats({ total, totalDuration, totalSize, transcribed });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 MB';
    const mb = (bytes / (1024 * 1024)).toFixed(1);
    return `${mb} MB`;
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const filteredRecordings = recordings.filter(
    (rec) =>
      rec.caller.includes(searchQuery) ||
      (rec.agent && rec.agent.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rec.queue && rec.queue.toLowerCase().includes(searchQuery.toLowerCase()))
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
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total calls</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
            <FileAudio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(stats.totalDuration)}</div>
            <p className="text-xs text-muted-foreground">Total duration</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <FileAudio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</div>
            <p className="text-xs text-muted-foreground">Storage used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transcribed</CardTitle>
            <FileAudio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.transcribed}
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
                      Agent: {recording.agent || 'N/A'} • {formatDateTime(recording.startTime).date} at {formatDateTime(recording.startTime).time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatDuration(recording.duration)}
                    </p>
                    <p className="text-xs text-gray-500">{formatFileSize(recording.fileSize || 0)}</p>
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

      {!loading && filteredRecordings.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {searchQuery ? 'No recordings found matching your search.' : 'No recordings available yet. Recordings will appear here after calls are completed.'}
        </div>
      )}

      {loading && (
        <div className="text-center py-12 text-gray-500">
          Loading recordings...
        </div>
      )}
    </div>
  );
}
