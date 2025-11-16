'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, History, FileText, HelpCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import AIChatWidget from '@/components/AIChatWidget';

export default function UserDashboardPage() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Welcome to Your Portal</h1>
        <p className="text-gray-500 mt-1">
          View your cases, call history, and get help from the Ministry of Education
        </p>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ y: -4, scale: 1.02 }}
        >
          <Link href="/dashboard/call-dialer">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 cursor-pointer hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Phone className="w-5 h-5" />
                  Start a Call
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-blue-800">
                  Make a direct call to the Ministry hotline and speak with an agent.
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now (117)
                </Button>
                <p className="text-xs text-blue-700">
                  Click to open the call dialer and contact support
                </p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ y: -4, scale: 1.02 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <History className="w-5 h-5" />
                My Call History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-emerald-800">
                Review your previous calls and follow-up actions taken by the Ministry.
              </p>
              <Link href="/dashboard/my-calls" className="inline-flex items-center text-sm font-medium text-emerald-900">
                Go to My Calls
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <p className="text-xs text-emerald-700">
                This helps you track the progress of your reports and enquiries.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          whileHover={{ y: -4, scale: 1.02 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <FileText className="w-5 h-5" />
                My Cases
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-purple-800">
                When a case is opened for your report, it will appear here with its status.
              </p>
              <Link href="/dashboard/citizen-chat" className="w-full">
                <Button
                  variant="outline"
                  className="w-full border-purple-300 text-purple-900 hover:bg-purple-50"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Get Help via Chat
                </Button>
              </Link>
              <p className="text-xs text-purple-700">
                Chat with AI or live support staff for instant help
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Chat Access */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Need Help Right Now?</h3>
              <p className="text-emerald-100 mb-4">
                Chat with our AI assistant or connect with a live support agent
              </p>
              <div className="flex gap-3">
                <Link href="/dashboard/citizen-chat">
                  <Button className="bg-white text-emerald-600 hover:bg-emerald-50">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Start Chat
                  </Button>
                </Link>
                <Link href="/dashboard/call-dialer">
                  <Button variant="outline" className="border-white text-white hover:bg-emerald-600">
                    <Phone className="w-4 h-4 mr-2" />
                    Call 117
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help & Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <HelpCircle className="w-5 h-5" />
              How This Portal Helps You
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-3 text-sm text-gray-700">
            <p>
              This web portal is designed mainly for staff, but citizens like you will be able to
              use it to:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>See a summary of your calls to the Ministry hotline</li>
              <li>Track the progress of important cases raised through the call center</li>
              <li>Access helpful information and guidance from the Ministry</li>
            </ul>
            <p className="text-xs text-gray-500 mt-4">
              For now, the main way to contact the Ministry is still via the call center number
              <span className="font-semibold"> 117</span> or through the mobile app.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Chat Widget */}
      <AIChatWidget />
    </div>
  );
}
