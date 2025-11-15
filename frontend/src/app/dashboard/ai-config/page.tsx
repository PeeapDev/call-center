'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Search, 
  Download,
  Globe,
  AlignLeft,
  CheckCircle2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TrainingDocument {
  id: string;
  title: string;
  description: string;
  filename: string;
  uploadedAt: string;
  fileSize: number;
  type: 'url' | 'file' | 'text';
  words?: number;
  state: 'trained' | 'processing' | 'failed';
}

export default function AIConfigPage() {
  const [documents, setDocuments] = useState<TrainingDocument[]>([]);
  const [selectedAll, setSelectedAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<'file' | 'url' | 'text'>('file');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('http://localhost:3001/ai-config/documents');
      const data = await response.json();
      if (data.status === 'ok') {
        // Map backend documents to include type and state
        const mappedDocs = data.documents.map((doc: any) => ({
          ...doc,
          type: 'file' as const,
          state: 'trained' as const,
          words: Math.floor(doc.fileSize / 5), // Rough estimate
        }));
        setDocuments(mappedDocs);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this training material?')) return;

    try {
      const response = await fetch(`http://localhost:3001/ai-config/documents/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.status === 'ok') {
        fetchDocuments();
      }
    } catch (error) {
      console.error('Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
    
    if (diffMonths < 1) return 'Recently';
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'url': return <Globe className="w-4 h-4" />;
      case 'text': return <AlignLeft className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Chatbot Training</h1>
        <p className="text-sm text-gray-600 mt-1">
          Take advantage of the power of AI to train your chatbots super fast.
        </p>
      </div>

      {/* Training Source Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="border-2 border-dashed hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer"
          onClick={() => {
            setUploadType('file');
            setShowUploadModal(true);
          }}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">File Upload</h3>
            <p className="text-sm text-gray-600">Train your chatbot from files</p>
          </CardContent>
        </Card>

        <Card 
          className="border-2 border-dashed hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer"
          onClick={() => {
            setUploadType('url');
            setShowUploadModal(true);
          }}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Website URL</h3>
            <p className="text-sm text-gray-600">Train from an entire website</p>
          </CardContent>
        </Card>

        <Card 
          className="border-2 border-dashed hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer"
          onClick={() => {
            setUploadType('text');
            setShowUploadModal(true);
          }}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <AlignLeft className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Plain Text</h3>
            <p className="text-sm text-gray-600">Train from your input text</p>
          </CardContent>
        </Card>
      </div>

      {/* Training Materials List */}
      <Card>
        <CardHeader className="border-b bg-gray-50/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Training Materials
              <span className="ml-2 text-sm font-normal text-gray-600">
                {filteredDocuments.length}/{documents.length} Training Materials
              </span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export to CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Search and Controls */}
          <div className="p-4 border-b flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedAll}
                onChange={(e) => setSelectedAll(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-600">Select All</span>
            </div>
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search material"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </Button>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 text-sm font-medium text-gray-600 border-b">
            <div className="col-span-4">Material</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-1">Words</div>
            <div className="col-span-2">Last Trained</div>
            <div className="col-span-2">State</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Document List */}
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-2">No training materials yet</p>
              <p className="text-sm text-gray-500 mb-4">
                Upload files, add websites, or input text to train your AI
              </p>
              <Button onClick={() => setShowUploadModal(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Add Training Material
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {filteredDocuments.map((doc) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate text-sm">
                        {doc.title}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {doc.description || doc.filename}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getTypeIcon(doc.type)}
                      <span className="text-xs capitalize">{doc.type}</span>
                    </Badge>
                  </div>
                  <div className="col-span-1 flex items-center text-sm text-gray-600">
                    {doc.words || '-'}
                  </div>
                  <div className="col-span-2 flex items-center text-sm text-gray-600">
                    {formatDate(doc.uploadedAt)}
                  </div>
                  <div className="col-span-2 flex items-center">
                    <Badge 
                      variant={doc.state === 'trained' ? 'default' : 'secondary'}
                      className={doc.state === 'trained' ? 'bg-green-100 text-green-700 border-green-200' : ''}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {doc.state === 'trained' ? 'Trained' : 'Processing'}
                    </Badge>
                  </div>
                  <div className="col-span-1 flex items-center justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(doc.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredDocuments.length > 0 && (
            <div className="px-4 py-3 border-t flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing 1-{Math.min(filteredDocuments.length, 16)} out of {filteredDocuments.length}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Prev
                </Button>
                <Button variant="outline" size="sm" className="bg-blue-500 text-white border-blue-500">
                  1
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="w-full max-w-2xl shadow-2xl">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  {uploadType === 'file' && <FileText className="w-5 h-5" />}
                  {uploadType === 'url' && <Globe className="w-5 h-5" />}
                  {uploadType === 'text' && <AlignLeft className="w-5 h-5" />}
                  Add Training Material - {uploadType === 'file' ? 'File Upload' : uploadType === 'url' ? 'Website URL' : 'Plain Text'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  This feature is being enhanced. For now, use the File Upload button to add PDF, TXT, or DOCX files.
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => setShowUploadModal(false)} className="flex-1">
                    Got it
                  </Button>
                  <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
