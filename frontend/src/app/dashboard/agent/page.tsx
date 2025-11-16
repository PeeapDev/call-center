'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Clock, CheckCircle, TrendingUp, Key, User, Lock, Copy, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
// import AgentCallInterface from '@/components/AgentCallInterface'; // Removed - will use real call interface
import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/lib/config';

export default function AgentDashboardPage() {
  const [myCredentials, setMyCredentials] = useState<any>(null);
  const [loadingCredentials, setLoadingCredentials] = useState(true);
  const [agentStats, setAgentStats] = useState({
    callsToday: 0,
    avgDuration: '0:00',
    completionRate: 0,
    customerSatisfaction: 0,
  });

  useEffect(() => {
    fetchMyCredentials();
  }, []);

  const fetchMyCredentials = async () => {
    try {
      // Get current user from session storage or local storage
      const userPhone = localStorage.getItem('userPhone');
      if (!userPhone) {
        setLoadingCredentials(false);
        return;
      }

      const response = await fetch(`${API_ENDPOINTS.hrUsers}`);
      const data = await response.json();
      
      if (data.status === 'ok') {
        const currentUser = data.users.find((u: any) => u.phoneNumber === userPhone);
        if (currentUser && currentUser.sipUsername) {
          setMyCredentials(currentUser);
        }
      }
    } catch (error) {
      console.error('Failed to fetch credentials:', error);
    } finally {
      setLoadingCredentials(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back! Ready to help citizens today.
        </p>
      </motion.div>

      {/* My WebRTC Credentials */}
      {myCredentials && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardHeader className="border-b bg-gradient-to-r from-purple-100 to-indigo-100">
              <CardTitle className="flex items-center gap-2">
                <Key className="w-6 h-6 text-purple-600" />
                My WebRTC Phone Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-purple-100">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Username</p>
                      <p className="text-sm font-mono font-bold text-gray-900">{myCredentials.sipUsername}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(myCredentials.sipUsername, 'Username')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copy username"
                  >
                    <Copy className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-purple-100">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Password</p>
                      <p className="text-xs text-gray-700">Same as login</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-500">Login</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-purple-100">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Extension</p>
                      <p className="text-sm font-mono font-bold text-gray-900">{myCredentials.sipExtension}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(myCredentials.sipExtension, 'Extension')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copy extension"
                  >
                    <Copy className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Agent Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <Phone className="w-8 h-8 mb-2" />
              <p className="text-3xl font-bold">{agentStats.callsToday}</p>
              <p className="text-sm text-blue-100">Calls Today</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <Clock className="w-8 h-8 mb-2" />
              <p className="text-3xl font-bold">{agentStats.avgDuration}</p>
              <p className="text-sm text-purple-100">Avg Duration</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <CheckCircle className="w-8 h-8 mb-2" />
              <p className="text-3xl font-bold">{agentStats.completionRate}%</p>
              <p className="text-sm text-green-100">Completion Rate</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <TrendingUp className="w-8 h-8 mb-2" />
              <p className="text-3xl font-bold">{agentStats.customerSatisfaction}</p>
              <p className="text-sm text-orange-100">Customer Rating</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <CardTitle>Today's Tips</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  1
                </div>
                <p className="text-gray-700">
                  Always verify caller identity for sensitive complaints
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  2
                </div>
                <p className="text-gray-700">
                  Use hold feature when you need to consult with a supervisor
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  3
                </div>
                <p className="text-gray-700">
                  Document all calls thoroughly with detailed notes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
