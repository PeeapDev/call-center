'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import AgentCallInterface from '@/components/AgentCallInterface';

export default function AgentDashboardPage() {
  // Mock agent stats
  const agentStats = {
    callsToday: 12,
    avgDuration: '4:32',
    completionRate: 94,
    customerSatisfaction: 4.7,
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

      {/* Call Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <AgentCallInterface />
      </motion.div>

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
