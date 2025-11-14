'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  HelpCircle,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  BarChart3,
} from 'lucide-react';
import { useState } from 'react';

// Mock content data
const mockBlogPosts = [
  {
    id: '1',
    title: 'How We Resolved 500+ Student Registration Issues in Q1 2025',
    status: 'published',
    author: 'Sarah Johnson',
    date: '2025-11-10',
    views: 1234,
  },
  {
    id: '2',
    title: 'Reducing Wait Times: Our AI-Powered Call Routing Success Story',
    status: 'published',
    author: 'Michael Chen',
    date: '2025-11-05',
    views: 892,
  },
  {
    id: '3',
    title: 'Draft: New Payment Gateway Integration Guide',
    status: 'draft',
    author: 'You',
    date: '2025-11-12',
    views: 0,
  },
];

const mockFAQs = [
  {
    id: '1',
    question: 'How do I register my child for the new academic year?',
    category: 'Registration',
    status: 'active',
    views: 2341,
  },
  {
    id: '2',
    question: 'What payment methods are accepted for school fees?',
    category: 'Fees & Payments',
    status: 'active',
    views: 1876,
  },
];

const mockStatistics = [
  { month: 'Jan', resolved: 245, label: 'Resolved Issues' },
  { month: 'Feb', resolved: 298, label: 'Resolved Issues' },
  { month: 'Mar', resolved: 312, label: 'Resolved Issues' },
  { month: 'Apr', resolved: 287, label: 'Resolved Issues' },
  { month: 'May', resolved: 334, label: 'Resolved Issues' },
  { month: 'Jun', resolved: 356, label: 'Resolved Issues' },
];

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState<'blog' | 'faq' | 'guidelines' | 'stats'>(
    'blog'
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-500 mt-1">
            Manage blog posts, FAQs, guidelines, and landing page statistics
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('blog')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'blog'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BookOpen className="w-5 h-5 inline mr-2" />
          Blog Posts
        </button>
        <button
          onClick={() => setActiveTab('faq')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'faq'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <HelpCircle className="w-5 h-5 inline mr-2" />
          FAQs
        </button>
        <button
          onClick={() => setActiveTab('guidelines')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'guidelines'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <CheckCircle className="w-5 h-5 inline mr-2" />
          Do's & Don'ts
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'stats'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="w-5 h-5 inline mr-2" />
          Statistics Data
        </button>
      </div>

      {/* Blog Posts Tab */}
      {activeTab === 'blog' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Blog Posts & Case Studies</h2>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Blog Post
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {mockBlogPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{post.title}</h3>
                        <Badge
                          variant={post.status === 'published' ? 'default' : 'secondary'}
                        >
                          {post.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        By {post.author} • {post.date} • {post.views} views
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-900 mb-2">
                📝 Blog Post Guidelines
              </h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Include real case studies and solutions</li>
                <li>Add relevant images or diagrams</li>
                <li>Use clear, simple language for public readership</li>
                <li>Tag posts with appropriate categories</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* FAQ Tab */}
      {activeTab === 'faq' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">FAQ Management</h2>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New FAQ
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {mockFAQs.map((faq) => (
                  <div
                    key={faq.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                        <Badge variant="outline">{faq.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">{faq.views} views</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Guidelines Tab */}
      {activeTab === 'guidelines' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Do's & Don'ts Guidelines
            </h2>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New Guideline
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Do's (25 items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Guidelines on best practices for schools and parents
                </p>
                <Button variant="outline" className="w-full">
                  Manage Do's
                </Button>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-red-600" />
                  Don'ts (25 items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Important warnings and things to avoid
                </p>
                <Button variant="outline" className="w-full">
                  Manage Don'ts
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Landing Page Statistics
            </h2>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Update Statistics
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Resolved Issues Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockStatistics.map((stat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{stat.month} 2025</p>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-2xl font-bold text-blue-600">{stat.resolved}</p>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-purple-900 mb-2">
                📊 Statistics Best Practices
              </h3>
              <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
                <li>Update statistics monthly with accurate data</li>
                <li>Verify numbers with your analytics dashboard</li>
                <li>Include both resolved and pending cases</li>
                <li>Add context or notes for significant changes</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
