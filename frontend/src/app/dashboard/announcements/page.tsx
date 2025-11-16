'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bell, Plus, Edit, Trash2, Calendar, Users } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/config';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'urgent';
  targetGroup: 'citizen' | 'agent' | 'all';
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info' as 'info' | 'warning' | 'urgent',
    targetGroup: 'all' as 'citizen' | 'agent' | 'all',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINTS.announcements}/all`);
      const data = await response.json();
      if (data.status === 'ok') {
        setAnnouncements(data.announcements || []);
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(API_ENDPOINTS.announcements, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.status === 'ok') {
        setShowForm(false);
        setFormData({
          title: '',
          content: '',
          type: 'info',
          targetGroup: 'all',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Failed to create announcement:', error);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;

    try {
      await fetch(`${API_ENDPOINTS.announcements}/${id}`, { method: 'DELETE' });
      fetchAnnouncements();
    } catch (error) {
      console.error('Failed to delete announcement:', error);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const endpoint = currentStatus 
        ? `${API_ENDPOINTS.announcements}/${id}/deactivate`
        : `${API_ENDPOINTS.announcements}/${id}`;
      
      const method = currentStatus ? 'PUT' : 'PUT';
      
      await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      
      fetchAnnouncements();
    } catch (error) {
      console.error('Failed to toggle announcement:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500 mt-1">Manage system-wide announcements</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Announcement
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Announcement</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Content</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <select
                    className="w-full border rounded-md p-2"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <Label>Target Group</Label>
                  <select
                    className="w-full border rounded-md p-2"
                    value={formData.targetGroup}
                    onChange={(e) => setFormData({ ...formData, targetGroup: e.target.value as any })}
                  >
                    <option value="all">Everyone</option>
                    <option value="citizen">Citizens Only</option>
                    <option value="agent">Agents Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Create Announcement</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Announcements List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            All Announcements ({announcements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No announcements yet. Create your first one!
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{announcement.title}</h3>
                        <Badge className={getTypeColor(announcement.type)}>
                          {announcement.type}
                        </Badge>
                        <Badge variant={announcement.isActive ? 'default' : 'secondary'}>
                          {announcement.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{announcement.content}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {announcement.targetGroup}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(announcement.startDate).toLocaleDateString()} - {new Date(announcement.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(announcement.id, announcement.isActive)}
                      >
                        {announcement.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteAnnouncement(announcement.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
