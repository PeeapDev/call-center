'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, User, ArrowRight, Search, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: Date;
  category: string;
  tags: string[];
  image?: string;
}

export default function BlogPage() {
  const [posts] = useState<BlogPost[]>([
    {
      id: '1',
      title: 'Understanding the New Enrollment Process for 2025',
      excerpt: 'Learn about the streamlined enrollment process and what documents you need to prepare for the upcoming academic year.',
      content: 'The Ministry of Education has implemented a new digital enrollment system...',
      author: 'Ministry Team',
      date: new Date('2024-11-15'),
      category: 'Enrollment',
      tags: ['enrollment', 'education', 'students'],
    },
    {
      id: '2',
      title: 'Scholarship Opportunities for 2025',
      excerpt: 'Discover the various scholarship programs available for students pursuing higher education.',
      content: 'We are pleased to announce expanded scholarship opportunities...',
      author: 'Scholarship Department',
      date: new Date('2024-11-12'),
      category: 'Scholarships',
      tags: ['scholarships', 'financial aid', 'students'],
    },
    {
      id: '3',
      title: 'Tips for Successful Parent-Teacher Communication',
      excerpt: 'Effective communication between parents and teachers is essential for student success.',
      content: 'Building strong partnerships between home and school...',
      author: 'Education Team',
      date: new Date('2024-11-10'),
      category: 'Parenting',
      tags: ['parenting', 'communication', 'education'],
    },
    {
      id: '4',
      title: 'New Digital Learning Resources Available',
      excerpt: 'Access free online learning materials and resources for students of all ages.',
      content: 'The Ministry has launched a new digital library...',
      author: 'Digital Learning Team',
      date: new Date('2024-11-08'),
      category: 'Digital Learning',
      tags: ['digital', 'resources', 'learning'],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const categories = Array.from(new Set(posts.map(post => post.category)));

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (selectedPost) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="outline" onClick={() => setSelectedPost(null)}>
          ← Back to Blog
        </Button>

        {/* Post Detail */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 space-y-4">
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 w-fit">
                {selectedPost.category}
              </Badge>
              <CardTitle className="text-3xl">{selectedPost.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{selectedPost.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{selectedPost.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {selectedPost.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  {selectedPost.excerpt}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {selectedPost.content}
                </p>
                {/* In a real app, this would be the full content */}
                <p className="text-gray-700 leading-relaxed mt-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-7 h-7 text-blue-600" />
          Ministry Blog & News
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Stay informed with the latest news, tips, and updates from the Ministry of Education
        </p>
      </motion.div>

      {/* Search & Categories */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Categories */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Tag className="w-4 h-4" />
              Categories:
            </span>
            <Button
              onClick={() => setSelectedCategory(null)}
              variant={!selectedCategory ? 'default' : 'outline'}
              size="sm"
            >
              All
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    {post.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {post.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight">{post.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex-1 flex flex-col">
                <p className="text-gray-600 text-sm mb-4 flex-1">{post.excerpt}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>

                  <div className="flex gap-1 flex-wrap">
                    {post.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    onClick={() => setSelectedPost(post)}
                    variant="outline"
                    className="w-full group"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center text-gray-400">
            <FileText className="w-16 h-16 mx-auto mb-4" />
            <p className="text-lg">No articles found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
