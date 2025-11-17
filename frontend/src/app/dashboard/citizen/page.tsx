'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageSquare, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function CitizenDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [myCalls, setMyCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // TODO: Fetch user's call history from backend
    // For now showing empty state
    setMyCalls([]);
    setLoading(false);
  }, [router]);

  const handleMakeCall = () => {
    // TODO: Implement call functionality
    alert('Call feature coming soon! This will connect you to the Ministry of Education call center.');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name || 'Citizen'}</h1>
            <p className="text-gray-500 mt-1">Ministry of Education Call Center</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <Card 
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl cursor-pointer"
              onClick={handleMakeCall}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Make a Call</CardTitle>
                <Phone className="h-5 w-5 text-white/80" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-blue-100">Connect with ministry staff</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Chat Support</CardTitle>
                <MessageSquare className="h-5 w-5 text-white/80" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-purple-100">AI assistant available 24/7</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
          >
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">View FAQs</CardTitle>
                <FileText className="h-5 w-5 text-white/80" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-orange-100">Common questions answered</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* My Calls History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                My Call History
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {myCalls.length === 0 ? (
                <div className="text-center py-12">
                  <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No calls yet</p>
                  <p className="text-gray-400 text-sm mt-2">Your call history will appear here</p>
                  <Button onClick={handleMakeCall} className="mt-6">
                    Make Your First Call
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myCalls.map((call, idx) => (
                    <motion.div
                      key={call.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.6 + idx * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          call.status === 'completed' ? 'bg-green-100' : 
                          call.status === 'missed' ? 'bg-red-100' : 'bg-yellow-100'
                        }`}>
                          {call.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : call.status === 'missed' ? (
                            <XCircle className="w-5 h-5 text-red-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{call.category}</p>
                          <p className="text-sm text-gray-500">{call.date} • {call.duration}</p>
                        </div>
                      </div>
                      <Badge variant={call.status === 'completed' ? 'default' : 'secondary'}>
                        {call.status}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="text-lg font-medium text-gray-900">{user?.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Type</p>
                  <p className="text-lg font-medium text-gray-900 capitalize">{user?.accountType || 'Citizen'}</p>
                </div>
                {user?.userCategory && (
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="text-lg font-medium text-gray-900 capitalize">{user.userCategory}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
