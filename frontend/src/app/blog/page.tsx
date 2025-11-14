'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Calendar, User, ArrowRight } from 'lucide-react';

// Mock blog posts
const blogPosts = [
  {
    id: '1',
    title: 'How We Resolved 500+ Student Registration Issues in Q1 2025',
    excerpt:
      'A deep dive into our systematic approach to handling the surge in student registration inquiries during the new academic year.',
    author: 'Sarah Johnson',
    date: '2025-11-10',
    category: 'Case Study',
    image: '/blog-1.jpg',
  },
  {
    id: '2',
    title: 'Reducing Wait Times: Our AI-Powered Call Routing Success Story',
    excerpt:
      'Learn how we implemented intelligent call routing to reduce average wait times from 2 minutes to 45 seconds.',
    author: 'Michael Chen',
    date: '2025-11-05',
    category: 'Technology',
    image: '/blog-2.jpg',
  },
  {
    id: '3',
    title: 'Common Fee Payment Issues and How to Avoid Them',
    excerpt:
      'A comprehensive guide for schools and parents on preventing common payment-related problems.',
    author: 'Emily Rodriguez',
    date: '2025-10-28',
    category: 'Guide',
    image: '/blog-3.jpg',
  },
  {
    id: '4',
    title: 'Collaborating with 50+ Schools: Our Outreach Program Results',
    excerpt:
      'Highlights from our school outreach initiative that helped reduce repeat calls by 35%.',
    author: 'David Kim',
    date: '2025-10-20',
    category: 'Impact',
    image: '/blog-4.jpg',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900">Ministry of Education</h1>
              <p className="text-xs text-gray-500">Blog & Case Studies</p>
            </div>
          </Link>
          <Link href="/landing">
            <Button variant="outline">← Back to Home</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">Blog & Case Studies</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Learn from our experiences and discover how we're transforming education
            support in Sierra Leone.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {blogPosts.map((post) => (
            <Card
              key={post.id}
              className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <div className="text-6xl">📝</div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <User className="w-4 h-4" />
                    {post.author}
                  </div>
                  <Button variant="outline" size="sm">
                    Read More <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 mb-4">
            Want to contribute your case study or success story?
          </p>
          <Link href="/login">
            <Button size="lg">Staff Login to Post</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400">
            © 2025 Ministry of Education, Sierra Leone. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
