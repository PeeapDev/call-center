'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, AlertCircle, FileText, MessageSquare, Shield, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import ChatBot from '@/components/ChatBot';

// Ministry statistics data - Complaints handled
const monthlyComplaintsResolved = [
  { month: 'Jan', resolved: 145, pending: 12 },
  { month: 'Feb', resolved: 178, pending: 8 },
  { month: 'Mar', resolved: 192, pending: 15 },
  { month: 'Apr', resolved: 167, pending: 11 },
  { month: 'May', resolved: 203, pending: 6 },
  { month: 'Jun', resolved: 218, pending: 9 },
];

const complaintCategories = [
  { category: 'Exam Malpractice', count: 234 },
  { category: 'Teacher Misconduct', count: 156 },
  { category: 'School Facilities', count: 123 },
  { category: 'Fee Irregularities', count: 98 },
  { category: 'Other Issues', count: 87 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-40 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900">Ministry of Education</h1>
              <p className="text-xs text-gray-500">Sierra Leone</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/blog" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Updates
            </Link>
            <Link href="/faq" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              FAQ
            </Link>
            <Link href="/dos-donts" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Guidelines
            </Link>
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700">Staff Login</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section with Banner and Grid */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-12 grid-rows-6 h-full">
            {[...Array(72)].map((_, i) => (
              <motion.div
                key={i}
                className="border border-white/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.05,
                }}
              />
            ))}
          </div>
        </div>

        <div className="container mx-auto px-6 py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block mb-4"
              >
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium">
                  🛡️ Protecting Academic Integrity
                </span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
              >
                Report Education
                <span className="block text-blue-200">Issues & Complaints</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-blue-100 mb-8 leading-relaxed"
              >
                Your voice matters. Report exam malpractice, teacher misconduct, facility issues, 
                and other education concerns. We're here to ensure quality education for all.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <a href="tel:+23276000000">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl text-lg px-8 py-6">
                    <Phone className="w-5 h-5 mr-2" />
                    Call Hotline
                  </Button>
                </a>
                <Link href="/faq">
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                    <FileText className="w-5 h-5 mr-2" />
                    File Complaint
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 flex items-center gap-6 text-white/90"
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Anonymous Reporting</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">100% Confidential</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Banner Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative z-10">
                {/* Grid of Service Cards */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: AlertCircle, title: 'Exam\nMalpractice', color: 'from-red-500 to-red-600' },
                    { icon: FileText, title: 'Teacher\nMisconduct', color: 'from-orange-500 to-orange-600' },
                    { icon: MessageSquare, title: 'School\nFacilities', color: 'from-green-500 to-green-600' },
                    { icon: Shield, title: 'Fee\nIrregularities', color: 'from-purple-500 to-purple-600' },
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      whileHover={{ scale: 1.05, rotate: 2 }}
                      className="relative"
                    >
                      <Card className={`bg-gradient-to-br ${item.color} border-0 shadow-2xl overflow-hidden`}>
                        <CardContent className="p-6 text-center">
                          <item.icon className="w-12 h-12 text-white mx-auto mb-3" />
                          <p className="text-white font-bold text-sm whitespace-pre-line leading-tight">
                            {item.title}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Floating Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
                >
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-white">698</div>
                      <div className="text-xs text-blue-200">Cases Resolved</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">97%</div>
                      <div className="text-xs text-blue-200">Success Rate</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">24/7</div>
                      <div className="text-xs text-blue-200">Available</div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Decorative Elements */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -top-10 -left-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"
              />
              <motion.div
                animate={{
                  y: [0, 20, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -bottom-10 -right-10 w-60 h-60 bg-purple-400/20 rounded-full blur-3xl"
              />
            </motion.div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto">
            <path
              fill="#ffffff"
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Ministry Impact Statistics */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Our Impact on Education
          </h2>
          <p className="text-xl text-gray-600">
            Transparency in action: Real data from our complaint resolution efforts
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Complaints Resolved Over Time */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Complaints Resolved (Monthly)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyComplaintsResolved}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="resolved"
                      stroke="#10b981"
                      strokeWidth={3}
                      name="Resolved"
                    />
                    <Line
                      type="monotone"
                      dataKey="pending"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Pending"
                    />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-sm text-gray-500 mt-4 text-center">
                  📈 97% resolution rate in 2025
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Complaint Categories */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  Top Complaint Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={complaintCategories}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-15} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" name="Cases Handled" />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-sm text-gray-500 mt-4 text-center">
                  🎯 698 total cases handled this quarter
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">Need to Report an Issue?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Your report can help improve education quality across Sierra Leone. 
              All complaints are taken seriously and investigated thoroughly.
            </p>
            <div className="flex items-center justify-center gap-4">
              <a href="tel:+23276000000">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl">
                  <Phone className="w-5 h-5 mr-2" />
                  +232 76 000 000
                </Button>
              </a>
              <Link href="/faq">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Ministry of Education</h3>
              <p className="text-gray-400 text-sm">
                Ensuring quality education and academic integrity across Sierra Leone.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/blog" className="hover:text-white">Updates & News</Link></li>
                <li><Link href="/faq" className="hover:text-white">Frequently Asked Questions</Link></li>
                <li><Link href="/dos-donts" className="hover:text-white">Guidelines</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Contact Us</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>📞 Hotline: +232 76 000 000</li>
                <li>✉️ complaints@education.gov.sl</li>
                <li>🕒 Mon-Fri: 8AM - 6PM</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-gray-400 text-sm">
            <p>© 2025 Ministry of Education, Sierra Leone. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* AI Chatbot */}
      <ChatBot />
    </div>
  );
}
