'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/spinner';
import {
  Search, Plus, User, Phone, Mail, School, GraduationCap,
  MapPin, AlertCircle, CheckCircle, Clock, FileText, X,
  ChevronDown, Filter
} from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/config';

interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  district?: string;
  guardianName?: string;
  guardianPhone?: string;
  schoolName?: string;
  schoolCode?: string;
  educationLevel: string;
  currentClass?: string;
  status: string;
  issues?: Array<{ id: string; type: string; description: string; status: string; createdAt: string }>;
  createdAt: string;
}

interface StudentCase {
  id: string;
  caseNumber: string;
  studentId: string;
  category: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  assignedAgentName?: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  graduated: 'bg-blue-100 text-blue-800',
  suspended: 'bg-red-100 text-red-800',
  transferred: 'bg-yellow-100 text-yellow-800',
  withdrawn: 'bg-gray-100 text-gray-800',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const caseStatusColors: Record<string, string> = {
  open: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

export default function StudentsPage() {
  const { showToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [cases, setCases] = useState<StudentCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'students' | 'cases'>('students');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStudents();
    fetchCases();
    fetchStats();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_ENDPOINTS.calls.replace('/calls', '/students')}?limit=50`);
      const data = await res.json();
      if (data.status === 'ok') {
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCases = async () => {
    try {
      const res = await fetch(`${API_ENDPOINTS.calls.replace('/calls', '/students/cases/all')}?limit=50`);
      const data = await res.json();
      if (data.status === 'ok') {
        setCases(data.cases || []);
      }
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const [studentStats, caseStats] = await Promise.all([
        fetch(`${API_ENDPOINTS.calls.replace('/calls', '/students/stats')}`).then(r => r.json()),
        fetch(`${API_ENDPOINTS.calls.replace('/calls', '/students/cases/stats')}`).then(r => r.json()),
      ]);
      setStats({ students: studentStats.stats, cases: caseStats.stats });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const searchStudents = async () => {
    if (!searchQuery.trim()) {
      fetchStudents();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.calls.replace('/calls', '/students')}?search=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.status === 'ok') {
        setStudents(data.students || []);
      }
    } catch (error) {
      showToast('Search failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s =>
    !searchQuery ||
    s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phoneNumber?.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Records</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage student information and track education-related cases
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowCaseModal(true)}>
            <FileText className="w-4 h-4 mr-2" />
            New Case
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
                <p className="text-2xl font-bold">{stats?.students?.total || 0}</p>
              </div>
              <GraduationCap className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Students</p>
                <p className="text-2xl font-bold text-green-600">{stats?.students?.byStatus?.active || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Open Cases</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.cases?.byStatus?.open || 0}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Urgent Cases</p>
                <p className="text-2xl font-bold text-red-600">{stats?.cases?.byPriority?.urgent || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('students')}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'students'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Students ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('cases')}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'cases'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Cases ({cases.length})
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={activeTab === 'students' ? "Search by name, student ID, or phone..." : "Search cases..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchStudents()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          />
        </div>
        <Button variant="outline" onClick={searchStudents}>
          <Filter className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : activeTab === 'students' ? (
        <div className="grid gap-4">
          {filteredStudents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <GraduationCap className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No students found</p>
                <Button className="mt-4" onClick={() => setShowAddModal(true)}>
                  Add First Student
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredStudents.map((student) => (
              <Card key={student.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedStudent(student)}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {student.firstName} {student.middleName} {student.lastName}
                          </h3>
                          <Badge className={statusColors[student.status] || 'bg-gray-100'}>
                            {student.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {student.studentId}
                          </span>
                          {student.phoneNumber && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {student.phoneNumber}
                            </span>
                          )}
                          {student.schoolName && (
                            <span className="flex items-center gap-1">
                              <School className="w-4 h-4" />
                              {student.schoolName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{student.educationLevel?.toUpperCase()}</Badge>
                      {student.currentClass && (
                        <p className="text-sm text-gray-500 mt-1">Class: {student.currentClass}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {cases.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No cases found</p>
                <Button className="mt-4" onClick={() => setShowCaseModal(true)}>
                  Create First Case
                </Button>
              </CardContent>
            </Card>
          ) : (
            cases.map((c) => (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{c.subject}</h3>
                        <Badge className={caseStatusColors[c.status] || 'bg-gray-100'}>{c.status}</Badge>
                        <Badge className={priorityColors[c.priority] || 'bg-gray-100'}>{c.priority}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{c.caseNumber} • {c.category}</p>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{c.description}</p>
                    </div>
                    <div className="text-right">
                      {c.assignedAgentName && (
                        <p className="text-sm text-gray-500">Assigned: {c.assignedAgentName}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedStudent(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">{selectedStudent.firstName} {selectedStudent.lastName}</h2>
                <p className="text-gray-500">Student ID: {selectedStudent.studentId}</p>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Phone</label>
                  <p className="font-medium">{selectedStudent.phoneNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium">{selectedStudent.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Date of Birth</label>
                  <p className="font-medium">{new Date(selectedStudent.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Gender</label>
                  <p className="font-medium">{selectedStudent.gender || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">School</label>
                  <p className="font-medium">{selectedStudent.schoolName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Education Level</label>
                  <p className="font-medium">{selectedStudent.educationLevel?.toUpperCase()}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Guardian</label>
                  <p className="font-medium">{selectedStudent.guardianName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Guardian Phone</label>
                  <p className="font-medium">{selectedStudent.guardianPhone || 'N/A'}</p>
                </div>
              </div>

              {selectedStudent.issues && selectedStudent.issues.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Recent Issues</h3>
                  <div className="space-y-2">
                    {selectedStudent.issues.slice(0, 5).map((issue) => (
                      <div key={issue.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex justify-between">
                          <span className="font-medium">{issue.type}</span>
                          <Badge className={issue.status === 'open' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                            {issue.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{issue.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button className="flex-1" onClick={() => { setShowCaseModal(true); }}>
                  <FileText className="w-4 h-4 mr-2" />
                  Create Case
                </Button>
                <Button variant="outline" onClick={() => showToast('Edit functionality coming soon', 'info')}>
                  Edit Student
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <AddStudentModal onClose={() => setShowAddModal(false)} onSuccess={() => { fetchStudents(); fetchStats(); }} />
      )}

      {/* Create Case Modal */}
      {showCaseModal && (
        <CreateCaseModal
          onClose={() => setShowCaseModal(false)}
          onSuccess={() => { fetchCases(); fetchStats(); }}
          preselectedStudent={selectedStudent}
        />
      )}
    </div>
  );
}

function AddStudentModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phoneNumber: '',
    guardianName: '',
    guardianPhone: '',
    schoolName: '',
    educationLevel: 'primary',
    currentClass: '',
    district: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.calls.replace('/calls', '/students')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.status === 'ok') {
        showToast('Student added successfully', 'success');
        onSuccess();
        onClose();
      } else {
        showToast(data.message || 'Failed to add student', 'error');
      }
    } catch (error) {
      showToast('Failed to add student', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Add New Student</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Student ID *</label>
              <input
                type="text"
                required
                value={form.studentId}
                onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                placeholder="e.g., STU-2024-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth *</label>
              <input
                type="date"
                required
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name *</label>
              <input
                type="text"
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">District</label>
              <input
                type="text"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Guardian Name</label>
              <input
                type="text"
                value={form.guardianName}
                onChange={(e) => setForm({ ...form, guardianName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Guardian Phone</label>
              <input
                type="tel"
                value={form.guardianPhone}
                onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">School Name</label>
              <input
                type="text"
                value={form.schoolName}
                onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Education Level</label>
              <select
                value={form.educationLevel}
                onChange={(e) => setForm({ ...form, educationLevel: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="primary">Primary</option>
                <option value="jss">Junior Secondary (JSS)</option>
                <option value="sss">Senior Secondary (SSS)</option>
                <option value="tertiary">Tertiary</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Current Class</label>
            <input
              type="text"
              value={form.currentClass}
              onChange={(e) => setForm({ ...form, currentClass: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder="e.g., JSS 2, Class 5"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? <Spinner size="sm" className="mr-2" /> : null}
              Add Student
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateCaseModal({ onClose, onSuccess, preselectedStudent }: {
  onClose: () => void;
  onSuccess: () => void;
  preselectedStudent?: Student | null;
}) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    studentId: preselectedStudent?.id || '',
    category: 'general',
    subject: '',
    description: '',
    priority: 'medium',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId) {
      showToast('Please select a student', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.calls.replace('/calls', '/students/cases')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.status === 'ok') {
        showToast('Case created successfully', 'success');
        onSuccess();
        onClose();
      } else {
        showToast(data.message || 'Failed to create case', 'error');
      }
    } catch (error) {
      showToast('Failed to create case', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Create New Case</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {preselectedStudent && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Creating case for: <strong>{preselectedStudent.firstName} {preselectedStudent.lastName}</strong>
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="general">General Inquiry</option>
                <option value="enrollment">Enrollment</option>
                <option value="scholarship">Scholarship</option>
                <option value="exam">Examination</option>
                <option value="transfer">Transfer</option>
                <option value="complaint">Complaint</option>
                <option value="fees">Fees/Payment</option>
                <option value="certificate">Certificate</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subject *</label>
            <input
              type="text"
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder="Brief summary of the issue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder="Detailed description of the case..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? <Spinner size="sm" className="mr-2" /> : null}
              Create Case
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
