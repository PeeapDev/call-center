import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import API_CONFIG from '../config/api';

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface Notice {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  date: string;
}

interface LandingScreenProps {
  userName: string;
  userType: 'citizen' | 'staff';
  onNavigate: (screen: 'call' | 'chat' | 'cases') => void;
  onLogout: () => void;
}

export default function LandingScreen({
  userName,
  userType,
  onNavigate,
  onLogout,
}: LandingScreenProps) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [faqs, setFAQs] = useState<FAQ[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalCalls: 0,
    resolvedCases: 0,
    avgResponseTime: '0',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load blogs
      const blogsResponse = await fetch(`${API_CONFIG.baseURL}/content/blog?limit=3`);
      if (blogsResponse.ok) {
        const blogsData = await blogsResponse.json();
        setBlogs(blogsData.slice(0, 3));
      }

      // Load FAQs
      const faqsResponse = await fetch(`${API_CONFIG.baseURL}/content/faq?limit=5`);
      if (faqsResponse.ok) {
        const faqsData = await faqsResponse.json();
        setFAQs(faqsData.slice(0, 5));
      }

      // Load notices (mock data for now)
      setNotices([
        {
          id: '1',
          title: 'System Maintenance',
          message: 'Scheduled maintenance on Saturday 8:00 PM - 10:00 PM',
          type: 'info',
          date: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'New Service Available',
          message: 'AI Chat Assistant now available 24/7!',
          type: 'success',
          date: new Date().toISOString(),
        },
      ]);

      // Load stats (mock)
      setStats({
        totalCalls: 15234,
        resolvedCases: 14891,
        avgResponseTime: '2.5 mins',
      });
    } catch (error) {
      console.error('Failed to load data:', error);
      // Use mock data if API fails
      setBlogs([
        {
          id: '1',
          title: 'New Academic Year Registration Opens',
          excerpt: 'Registration for the 2024/2025 academic year is now open...',
          date: '2024-11-10',
          category: 'Announcements',
        },
        {
          id: '2',
          title: 'Scholarship Program Updates',
          excerpt: 'Applications for merit-based scholarships are available...',
          date: '2024-11-08',
          category: 'Scholarships',
        },
        {
          id: '3',
          title: 'Teacher Training Workshop',
          excerpt: 'Professional development workshops scheduled for all districts...',
          date: '2024-11-05',
          category: 'Training',
        },
      ]);

      setFAQs([
        {
          id: '1',
          question: 'How do I register my child for school?',
          answer: 'Visit your nearest school with birth certificate and proof of residence.',
          category: 'Registration',
        },
        {
          id: '2',
          question: 'What are the school fees?',
          answer: 'Primary education is free. Secondary schools vary by institution.',
          category: 'Fees',
        },
        {
          id: '3',
          question: 'How can I apply for a scholarship?',
          answer: 'Visit our website or call the hotline for scholarship information.',
          category: 'Scholarships',
        },
      ]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getNoticeStyle = (type: Notice['type']) => {
    switch (type) {
      case 'warning':
        return { backgroundColor: '#fef3c7', borderColor: '#fbbf24' };
      case 'success':
        return { backgroundColor: '#d1fae5', borderColor: '#10b981' };
      default:
        return { backgroundColor: '#dbeafe', borderColor: '#3b82f6' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back! 👋</Text>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userType}>
            {userType === 'staff' ? '👨‍💼 Staff Member' : '👤 Citizen'}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#2563eb' }]}
              onPress={() => onNavigate('call')}
            >
              <Text style={styles.actionIcon}>📞</Text>
              <Text style={styles.actionTitle}>Call Ministry</Text>
              <Text style={styles.actionSubtitle}>Talk to an agent</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#10b981' }]}
              onPress={() => onNavigate('chat')}
            >
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionTitle}>AI Chat</Text>
              <Text style={styles.actionSubtitle}>24/7 assistant</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#f59e0b' }]}
              onPress={() => onNavigate('cases')}
            >
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionTitle}>My Cases</Text>
              <Text style={styles.actionSubtitle}>Track status</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Statistics</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalCalls.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Calls</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.resolvedCases.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Resolved Cases</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.avgResponseTime}</Text>
              <Text style={styles.statLabel}>Avg Response</Text>
            </View>
          </View>
        </View>

        {/* Notices */}
        {notices.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📢 Important Notices</Text>
            {notices.map((notice) => (
              <View
                key={notice.id}
                style={[styles.noticeCard, getNoticeStyle(notice.type)]}
              >
                <Text style={styles.noticeTitle}>{notice.title}</Text>
                <Text style={styles.noticeMessage}>{notice.message}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Latest Blog Posts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📰 Latest News</Text>
          {blogs.map((blog) => (
            <View key={blog.id} style={styles.blogCard}>
              <View style={styles.blogHeader}>
                <Text style={styles.blogCategory}>{blog.category}</Text>
                <Text style={styles.blogDate}>{blog.date}</Text>
              </View>
              <Text style={styles.blogTitle}>{blog.title}</Text>
              <Text style={styles.blogExcerpt}>{blog.excerpt}</Text>
            </View>
          ))}
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❓ Frequently Asked Questions</Text>
          {faqs.map((faq) => (
            <View key={faq.id} style={styles.faqCard}>
              <Text style={styles.faqQuestion}>Q: {faq.question}</Text>
              <Text style={styles.faqAnswer}>A: {faq.answer}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#2563eb',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
  },
  userType: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionCard: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  actionSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
  noticeCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  noticeMessage: {
    fontSize: 13,
    color: '#374151',
  },
  blogCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  blogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  blogCategory: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '600',
  },
  blogDate: {
    fontSize: 11,
    color: '#9ca3af',
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
  },
  blogExcerpt: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20,
  },
  faqCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20,
  },
});
