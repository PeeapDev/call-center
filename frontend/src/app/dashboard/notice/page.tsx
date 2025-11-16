'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, AlertCircle, Info, CheckCircle, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface Notice {
  id: string;
  title: string;
  content: string;
  type: 'urgent' | 'important' | 'info';
  date: Date;
  read: boolean;
}

export default function NoticePage() {
  const [notices, setNotices] = useState<Notice[]>([
    {
      id: '1',
      title: 'System Maintenance Scheduled',
      content: 'The portal will be under maintenance on Saturday, November 18, 2024, from 2:00 AM to 6:00 AM. During this time, all services will be temporarily unavailable.',
      type: 'important',
      date: new Date('2024-11-15'),
      read: false,
    },
    {
      id: '2',
      title: 'New Enrollment Period Announced',
      content: 'The Ministry of Education is pleased to announce that the enrollment period for the 2025 academic year will begin on January 5, 2025. Please ensure all required documents are prepared.',
      type: 'urgent',
      date: new Date('2024-11-14'),
      read: false,
    },
    {
      id: '3',
      title: 'Holiday Office Hours',
      content: 'Please note that our offices will be closed on December 24-26, 2024, for the holiday season. Emergency services will be available through the hotline.',
      type: 'info',
      date: new Date('2024-11-12'),
      read: true,
    },
    {
      id: '4',
      title: 'Updated Contact Information',
      content: 'We have updated our contact information. The new hotline number is 117. Please update your records accordingly.',
      type: 'info',
      date: new Date('2024-11-10'),
      read: true,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notice.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'unread' ? !notice.read :
      filter === 'urgent' ? notice.type === 'urgent' : true;
    
    return matchesSearch && matchesFilter;
  });

  const markAsRead = (id: string) => {
    setNotices(notices.map(notice => 
      notice.id === id ? { ...notice, read: true } : notice
    ));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'important':
        return <Bell className="w-5 h-5 text-orange-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Urgent</Badge>;
      case 'important':
        return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Important</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Info</Badge>;
    }
  };

  const unreadCount = notices.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-7 h-7 text-blue-600" />
              Notices & Announcements
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Stay updated with important notifications from the Ministry
            </p>
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white">
              {unreadCount} Unread
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Filters & Search */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  filter === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  filter === 'unread' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter('urgent')}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  filter === 'urgent' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Urgent
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notices List */}
      <div className="space-y-4">
        {filteredNotices.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center text-gray-400">
              <Bell className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg">No notices found</p>
            </CardContent>
          </Card>
        ) : (
          filteredNotices.map((notice, index) => (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer ${
                !notice.read ? 'border-l-4 border-l-blue-600' : ''
              }`}
              onClick={() => markAsRead(notice.id)}
              >
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getTypeIcon(notice.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getTypeBadge(notice.type)}
                          {!notice.read && (
                            <Badge className="bg-blue-600 text-white">New</Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg">{notice.title}</CardTitle>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {notice.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-gray-700 leading-relaxed">{notice.content}</p>
                  {notice.read && (
                    <div className="mt-3 flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Read</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
