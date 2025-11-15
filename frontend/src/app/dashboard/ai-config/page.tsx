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
  const [uploadType, setUploadType] = useState<'file' | 'url' | 'text' | 'post'>('file');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [postImage, setPostImage] = useState<File | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (uploadType === 'file' && (!selectedFile || !title)) {
      alert('Please provide a title and select a file');
      return;
    }
    if (uploadType === 'url' && (!websiteUrl || !title)) {
      alert('Please provide a title and website URL');
      return;
    }
    if (uploadType === 'text' && (!textContent || !title)) {
      alert('Please provide a title and text content');
      return;
    }
    if (uploadType === 'post' && (!postImage || !title || !description)) {
      alert('Please provide a title, description, and image');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      
      if (uploadType === 'file') {
        formData.append('file', selectedFile!);
      } else if (uploadType === 'url') {
        formData.append('url', websiteUrl);
      } else if (uploadType === 'text') {
        // Create a text file from the content
        const textBlob = new Blob([textContent], { type: 'text/plain' });
        formData.append('file', textBlob, 'text-input.txt');
      } else if (uploadType === 'post') {
        formData.append('file', postImage!);
        formData.append('isPost', 'true');
      }
      
      formData.append('title', title);
      formData.append('description', description);

      const response = await fetch('http://localhost:3001/ai-config/documents', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.status === 'ok') {
        alert('Training material added successfully!');
        setShowUploadModal(false);
        resetForm();
        fetchDocuments();
      } else {
        alert(`Upload failed: ${data.message}`);
      }
    } catch (error) {
      alert('Failed to upload training material');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedFile(null);
    setWebsiteUrl('');
    setTextContent('');
    setPostImage(null);
  };

  const handleReTrain = async (id: string) => {
    if (!confirm('Re-train AI with this material? This will update the AI knowledge base.')) return;
    
    try {
      // In a real implementation, this would trigger retraining
      alert('AI re-training initiated! This may take a few minutes.');
      // You could add a backend endpoint for retraining
    } catch (error) {
      alert('Failed to initiate re-training');
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          className="border-2 border-dashed hover:border-purple-500 hover:bg-purple-50/50 transition-all cursor-pointer"
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
          className="border-2 border-dashed hover:border-green-500 hover:bg-green-50/50 transition-all cursor-pointer"
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

        <Card 
          className="border-2 border-dashed hover:border-orange-500 hover:bg-orange-50/50 transition-all cursor-pointer"
          onClick={() => {
            setUploadType('post');
            setShowUploadModal(true);
          }}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Post</h3>
            <p className="text-sm text-gray-600">Add image with description</p>
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
                  <div className="col-span-1 flex items-center justify-end relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </Button>
                    
                    {openMenuId === doc.id && (
                      <div className="absolute right-0 top-8 mt-2 w-40 bg-white border rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => {
                            handleReTrain(doc.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 rounded-t-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Re-Train
                        </button>
                        <button
                          onClick={() => {
                            handleDelete(doc.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 rounded-b-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
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
                  {uploadType === 'post' && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                  Add Training Material - {
                    uploadType === 'file' ? 'File Upload' : 
                    uploadType === 'url' ? 'Website URL' : 
                    uploadType === 'text' ? 'Plain Text' :
                    'Post'
                  }
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {uploadType === 'file' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Document Title *
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., School Enrollment Policy 2024"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief description of what this document contains..."
                        rows={3}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        File * (PDF, TXT, DOCX - max 10MB)
                      </label>
                      <div
                        onClick={() => document.getElementById('file-input')?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all"
                      >
                        {selectedFile ? (
                          <div>
                            <FileText className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                            <p className="font-medium text-gray-900">{selectedFile.name}</p>
                            <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">Click to select file</p>
                            <p className="text-xs text-gray-400 mt-1">PDF, TXT, DOCX (max 10MB)</p>
                          </div>
                        )}
                      </div>
                      <input
                        id="file-input"
                        type="file"
                        onChange={handleFileSelect}
                        accept=".pdf,.txt,.doc,.docx"
                        className="hidden"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleUpload}
                        disabled={!title || !selectedFile || uploading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        {uploading ? 'Uploading...' : 'Upload Document'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowUploadModal(false);
                          setTitle('');
                          setDescription('');
                          setSelectedFile(null);
                        }}
                        disabled={uploading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : uploadType === 'url' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website Title *
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Ministry Website FAQ"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website URL *
                      </label>
                      <input
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        AI will scrape and learn from the entire website content
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What information does this website contain?"
                        rows={2}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleUpload}
                        disabled={!title || !websiteUrl || uploading}
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                      >
                        {uploading ? 'Adding...' : 'Add Website'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowUploadModal(false);
                          resetForm();
                        }}
                        disabled={uploading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : uploadType === 'text' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Text Title *
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., School Policies"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter Text *
                      </label>
                      <div className="text-xs text-gray-500 mb-2">
                        Write down or paste your text in the input below.
                      </div>
                      <textarea
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        placeholder="Enter here..."
                        rows={12}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {textContent.length} characters • ~{Math.floor(textContent.split(' ').length)} words
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleUpload}
                        disabled={!title || !textContent || uploading}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {uploading ? 'Adding...' : 'Add for training'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowUploadModal(false);
                          resetForm();
                        }}
                        disabled={uploading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Post Title *
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Campus Building Map"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description * (What's in the image?)
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what the image shows and what citizens should know about it..."
                        rows={4}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        AI will show this image when citizens ask related questions
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image * (JPG, PNG - max 5MB)
                      </label>
                      <div
                        onClick={() => document.getElementById('post-image-input')?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-orange-500 hover:bg-orange-50/50 transition-all"
                      >
                        {postImage ? (
                          <div>
                            <svg className="w-12 h-12 text-orange-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="font-medium text-gray-900">{postImage.name}</p>
                            <p className="text-sm text-gray-500">{formatFileSize(postImage.size)}</p>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">Click to select image</p>
                            <p className="text-xs text-gray-400 mt-1">JPG, PNG (max 5MB)</p>
                          </div>
                        )}
                      </div>
                      <input
                        id="post-image-input"
                        type="file"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setPostImage(e.target.files[0]);
                          }
                        }}
                        accept="image/jpeg,image/png,image/jpg"
                        className="hidden"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleUpload}
                        disabled={!title || !description || !postImage || uploading}
                        className="flex-1 bg-orange-600 hover:bg-orange-700"
                      >
                        {uploading ? 'Adding...' : 'Add Post'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowUploadModal(false);
                          resetForm();
                        }}
                        disabled={uploading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
