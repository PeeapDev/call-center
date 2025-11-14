'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Users, Clock, TrendingUp, Brain, ThumbsUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Mock data for demonstration
const mockActiveCalls = [
  {
    id: '1',
    caller: '+232 76 123 456',
    agent: 'Sarah Johnson',
    duration: 142,
    status: 'active',
    queue: 'Technical Support',
  },
  {
    id: '2',
    caller: '+232 77 987 654',
    agent: 'Michael Chen',
    duration: 87,
    status: 'active',
    queue: 'General Inquiry',
  },
  {
    id: '3',
    caller: '+232 78 555 123',
    agent: null,
    duration: 34,
    status: 'waiting',
    queue: 'Student Services',
  },
];

const mockAgents = [
  { id: '1', name: 'Sarah Johnson', status: 'on-call', calls: 8 },
  { id: '2', name: 'Michael Chen', status: 'on-call', calls: 6 },
  { id: '3', name: 'Emily Rodriguez', status: 'available', calls: 5 },
  { id: '4', name: 'David Kim', status: 'break', calls: 7 },
  { id: '5', name: 'Lisa Thompson', status: 'offline', calls: 0 },
];

const mockQueueStats = {
  waiting: 3,
  avgWaitTime: 45,
  totalToday: 127,
  avgCallDuration: 3.2,
};

// Analytics chart data
const callsOverTimeData = [
  { time: '9 AM', calls: 12, avgDuration: 3.5 },
  { time: '10 AM', calls: 18, avgDuration: 4.2 },
  { time: '11 AM', calls: 15, avgDuration: 3.8 },
  { time: '12 PM', calls: 10, avgDuration: 2.9 },
  { time: '1 PM', calls: 8, avgDuration: 3.1 },
  { time: '2 PM', calls: 14, avgDuration: 4.5 },
  { time: '3 PM', calls: 16, avgDuration: 3.7 },
];

const sentimentData = [
  { name: 'Positive', value: 68, color: '#10b981' },
  { name: 'Neutral', value: 22, color: '#6b7280' },
  { name: 'Negative', value: 10, color: '#ef4444' },
];

const agentPerformanceData = [
  { name: 'Sarah J', calls: 12, satisfaction: 9.2 },
  { name: 'Michael C', calls: 9, satisfaction: 8.5 },
  { name: 'Emily R', calls: 11, satisfaction: 9.0 },
  { name: 'David K', calls: 8, satisfaction: 7.8 },
  { name: 'Lisa T', calls: 10, satisfaction: 8.9 },
];

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function DashboardPage() {
  const [backendHealth, setBackendHealth] = useState<any>(null);
  const [time, setTime] = useState(0);
  const { data: session } = useSession();
  const router = useRouter();

  // Redirect agents to their simplified dashboard
  useEffect(() => {
    const user = session?.user as any;
    if (user?.role === 'agent') {
      router.push('/dashboard/agent');
    }
  }, [session, router]);

  // Fetch backend health status
  useEffect(() => {
    fetch('http://localhost:3001/health')
      .then((res) => res.json())
      .then((data) => setBackendHealth(data))
      .catch((err) => console.error('Backend not reachable:', err));
  }, []);

  // Simulate real-time call duration updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Real-time call center monitoring
          {backendHealth && (
            <Badge
              variant={backendHealth.asterisk.ariConnected ? 'default' : 'secondary'}
              className="ml-3"
            >
              {backendHealth.asterisk.ariConnected
                ? 'Asterisk Connected'
                : 'Mock Data Mode'}
            </Badge>
          )}
        </p>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ scale: 1.05, y: -5 }}
        >
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Active Calls</CardTitle>
              <Phone className="h-5 w-5 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{mockActiveCalls.filter((c) => c.status === 'active').length}</div>
              <p className="text-xs text-blue-100">
                {mockActiveCalls.filter((c) => c.status === 'waiting').length} waiting
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ scale: 1.05, y: -5 }}
        >
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Agents Online</CardTitle>
              <Users className="h-5 w-5 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {mockAgents.filter((a) => a.status !== 'offline').length}/{mockAgents.length}
              </div>
              <p className="text-xs text-purple-100">
                {mockAgents.filter((a) => a.status === 'on-call').length} on active calls
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ scale: 1.05, y: -5 }}
        >
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Avg Wait Time</CardTitle>
              <Clock className="h-5 w-5 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{mockQueueStats.avgWaitTime}s</div>
              <p className="text-xs text-orange-100">
                {mockQueueStats.waiting} in queue
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.05, y: -5 }}
        >
          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Calls Today</CardTitle>
              <TrendingUp className="h-5 w-5 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{mockQueueStats.totalToday}</div>
              <p className="text-xs text-pink-100">
                Avg {mockQueueStats.avgCallDuration} min/call
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          whileHover={{ scale: 1.05, y: -5 }}
        >
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">AI Sentiment</CardTitle>
              <ThumbsUp className="h-5 w-5 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">7.8/10</div>
              <p className="text-xs text-green-100">
                68% positive calls
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Active Calls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-600" />
              Active Calls
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {mockActiveCalls.map((call, idx) => (
                <motion.div
                  key={call.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 + idx * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${
                    call.status === 'active'
                      ? 'bg-green-50 border-green-500'
                      : 'bg-yellow-50 border-yellow-500'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        call.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-pulse'
                      }`}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{call.caller}</p>
                      <p className="text-sm text-gray-600">
                        {call.agent ? `Agent: ${call.agent}` : 'Waiting in queue'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="bg-white">{call.queue}</Badge>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {formatDuration(call.duration + time)}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{call.status}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Agents Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Agent Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockAgents.map((agent, idx) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 1.1 + idx * 0.1 }}
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    agent.status === 'on-call'
                      ? 'bg-blue-50 border-2 border-blue-200'
                      : agent.status === 'available'
                        ? 'bg-green-50 border-2 border-green-200'
                        : agent.status === 'break'
                          ? 'bg-orange-50 border-2 border-orange-200'
                          : 'bg-gray-50 border-2 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      agent.status === 'on-call'
                        ? 'bg-blue-500 text-white'
                        : agent.status === 'available'
                          ? 'bg-green-500 text-white'
                          : agent.status === 'break'
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-400 text-white'
                    }`}>
                      {agent.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{agent.name}</p>
                      <p className="text-sm text-gray-600">{agent.calls} calls today</p>
                    </div>
                  </div>
                  <Badge
                    className={
                      agent.status === 'on-call'
                        ? 'bg-blue-500 text-white'
                        : agent.status === 'available'
                          ? 'bg-green-500 text-white'
                          : agent.status === 'break'
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-500 text-white'
                    }
                  >
                    {agent.status}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Analytics Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calls Over Time */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Calls Over Time
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={callsOverTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="calls"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="Total Calls"
                    dot={{ fill: '#3b82f6', r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgDuration"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    name="Avg Duration (min)"
                    dot={{ fill: '#8b5cf6', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sentiment Analysis */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-green-600" />
                AI Sentiment Analysis
              </CardTitle>
            </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <ResponsiveContainer width="60%" height={250}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {sentimentData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-2xl font-bold" style={{ color: item.color }}>
                        {item.value}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        </motion.div>
      </div>

      {/* Agent Performance */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.8 }}
        whileHover={{ scale: 1.01 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Agent Performance & Satisfaction Scores
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agentPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                <Tooltip contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }} />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="calls"
                  fill="#3b82f6"
                  name="Total Calls"
                  radius={[8, 8, 0, 0]}
                />
              <Bar
                yAxisId="right"
                dataKey="satisfaction"
                fill="#10b981"
                name="Satisfaction Score"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      </motion.div>
    </div>
  );
}
