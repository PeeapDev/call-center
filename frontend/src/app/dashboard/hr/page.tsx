'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Edit,
  Trash2,
  Search,
  Filter
} from 'lucide-react';
import { useState } from 'react';

// Staff types/roles
const staffTypes = [
  { id: 'agent', name: 'Call Center Agent', color: 'bg-blue-500' },
  { id: 'supervisor', name: 'Supervisor', color: 'bg-purple-500' },
  { id: 'admin', name: 'Administrator', color: 'bg-red-500' },
  { id: 'analyst', name: 'Analyst', color: 'bg-green-500' },
  { id: 'auditor', name: 'Auditor', color: 'bg-orange-500' },
  { id: 'hr', name: 'HR Manager', color: 'bg-pink-500' },
];

// Mock staff data
const mockStaff = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@education.gov',
    staffType: 'supervisor',
    employeeId: 'EMP001',
    department: 'Operations',
    phone: '+232 76 123 456',
    joinDate: '2023-01-15',
    status: 'active',
    attendance: {
      present: 22,
      absent: 1,
      late: 2,
      percentage: 88,
    },
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@education.gov',
    staffType: 'agent',
    employeeId: 'EMP002',
    department: 'Support',
    phone: '+232 77 987 654',
    joinDate: '2023-03-20',
    status: 'active',
    attendance: {
      present: 24,
      absent: 0,
      late: 1,
      percentage: 96,
    },
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@education.gov',
    staffType: 'agent',
    employeeId: 'EMP003',
    department: 'Support',
    phone: '+232 78 456 789',
    joinDate: '2023-02-10',
    status: 'active',
    attendance: {
      present: 23,
      absent: 1,
      late: 1,
      percentage: 92,
    },
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.kim@education.gov',
    staffType: 'analyst',
    employeeId: 'EMP004',
    department: 'Analytics',
    phone: '+232 79 321 654',
    joinDate: '2023-04-05',
    status: 'active',
    attendance: {
      present: 25,
      absent: 0,
      late: 0,
      percentage: 100,
    },
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    email: 'lisa.thompson@education.gov',
    staffType: 'admin',
    employeeId: 'EMP005',
    department: 'Administration',
    phone: '+232 76 654 321',
    joinDate: '2022-11-01',
    status: 'active',
    attendance: {
      present: 24,
      absent: 1,
      late: 0,
      percentage: 96,
    },
  },
  {
    id: '6',
    name: 'James Wilson',
    email: 'james.wilson@education.gov',
    staffType: 'agent',
    employeeId: 'EMP006',
    department: 'Support',
    phone: '+232 77 789 456',
    joinDate: '2023-05-15',
    status: 'on-leave',
    attendance: {
      present: 20,
      absent: 3,
      late: 2,
      percentage: 80,
    },
  },
];

// Today's attendance
const todayAttendance = [
  { staffId: '1', name: 'Sarah Johnson', checkIn: '08:45 AM', status: 'present' },
  { staffId: '2', name: 'Michael Chen', checkIn: '08:55 AM', status: 'present' },
  { staffId: '3', name: 'Emily Rodriguez', checkIn: '09:10 AM', status: 'late' },
  { staffId: '4', name: 'David Kim', checkIn: '08:30 AM', status: 'present' },
  { staffId: '5', name: 'Lisa Thompson', checkIn: '08:50 AM', status: 'present' },
  { staffId: '6', name: 'James Wilson', checkIn: '-', status: 'on-leave' },
];

export default function HRManagementPage() {
  const [activeTab, setActiveTab] = useState<'staff' | 'attendance' | 'types'>('staff');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [staffList, setStaffList] = useState(mockStaff);
  const [newStaff, setNewStaff] = useState<{
    name: string;
    email: string;
    employeeId: string;
    phone: string;
    staffType: string;
    department: string;
    joinDate: string;
    status: 'active' | 'on-leave' | 'inactive';
  }>({
    name: '',
    email: '',
    employeeId: '',
    phone: '',
    staffType: '',
    department: '',
    joinDate: '',
    status: 'active',
  });

  const activeStaff = staffList.filter((s) => s.status === 'active');
  const avgAttendance = Math.round(
    staffList.reduce((acc, s) => acc + s.attendance.percentage, 0) / staffList.length
  );
  const presentToday = todayAttendance.filter((a) => a.status === 'present').length;

  const getStaffTypeName = (typeId: string) => {
    return staffTypes.find((t) => t.id === typeId)?.name || typeId;
  };

  const getStaffTypeColor = (typeId: string) => {
    return staffTypes.find((t) => t.id === typeId)?.color || 'bg-gray-500';
  };

  const handleAddStaff = () => {
    // Validate required fields
    if (!newStaff.name || !newStaff.email || !newStaff.employeeId || !newStaff.phone || 
        !newStaff.staffType || !newStaff.department || !newStaff.joinDate) {
      alert('Please fill in all required fields');
      return;
    }

    // Create new staff member
    const staff = {
      id: String(staffList.length + 1),
      name: newStaff.name,
      email: newStaff.email,
      staffType: newStaff.staffType,
      employeeId: newStaff.employeeId,
      department: newStaff.department,
      phone: newStaff.phone,
      joinDate: newStaff.joinDate,
      status: newStaff.status,
      attendance: {
        present: 0,
        absent: 0,
        late: 0,
        percentage: 0,
      },
    };

    // Add to staff list
    setStaffList([...staffList, staff]);

    // Reset form
    setNewStaff({
      name: '',
      email: '',
      employeeId: '',
      phone: '',
      staffType: '',
      department: '',
      joinDate: '',
      status: 'active',
    });

    // Close modal
    setShowAddStaffModal(false);

    // Show success message
    alert(`✅ ${staff.name} has been added successfully!`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Human Resources</h1>
          <p className="text-gray-500 mt-1">Manage staff, attendance, and organizational structure</p>
        </div>
        <Button onClick={() => setShowAddStaffModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Staff
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffList.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeStaff.length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentToday}</div>
            <p className="text-xs text-muted-foreground">Out of {mockStaff.length} staff</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{avgAttendance}%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Types</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffTypes.length}</div>
            <p className="text-xs text-muted-foreground">Roles configured</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('staff')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'staff'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Staff Management
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'attendance'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Attendance
          </button>
          <button
            onClick={() => setActiveTab('types')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'types'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Filter className="w-4 h-4 inline mr-2" />
            Staff Types
          </button>
        </nav>
      </div>

      {/* Staff Management Tab */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search staff by name, email, or employee ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md"
                  />
                </div>
                <select className="px-4 py-2 border rounded-md">
                  <option value="">All Types</option>
                  {staffTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                <select className="px-4 py-2 border rounded-md">
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="on-leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Staff List */}
          <Card>
            <CardHeader>
              <CardTitle>All Staff Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staffList.map((staff) => (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                        {staff.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-semibold text-gray-900">{staff.name}</p>
                          <Badge className={getStaffTypeColor(staff.staffType)}>
                            {getStaffTypeName(staff.staffType)}
                          </Badge>
                          <Badge
                            variant={staff.status === 'active' ? 'secondary' : 'outline'}
                            className={staff.status === 'active' ? 'bg-green-500' : ''}
                          >
                            {staff.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {staff.email} • {staff.employeeId}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {staff.department} • Joined {staff.joinDate} • {staff.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {staff.attendance.percentage}%
                        </p>
                        <p className="text-xs text-gray-500">Attendance</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Today's Attendance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Today's Attendance - {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayAttendance.map((record) => (
                  <div
                    key={record.staffId}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {record.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{record.name}</p>
                        <p className="text-sm text-gray-500">Check-in: {record.checkIn}</p>
                      </div>
                    </div>
                    <Badge
                      className={
                        record.status === 'present'
                          ? 'bg-green-500'
                          : record.status === 'late'
                            ? 'bg-yellow-500'
                            : record.status === 'on-leave'
                              ? 'bg-blue-500'
                              : 'bg-red-500'
                      }
                    >
                      {record.status === 'present' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {record.status === 'late' && <Clock className="w-3 h-3 mr-1" />}
                      {record.status === 'on-leave' && <Calendar className="w-3 h-3 mr-1" />}
                      {record.status === 'absent' && <XCircle className="w-3 h-3 mr-1" />}
                      {record.status.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staffList.map((staff) => (
                  <div key={staff.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <p className="font-medium text-gray-900">{staff.name}</p>
                        <Badge className={getStaffTypeColor(staff.staffType)} variant="outline">
                          {getStaffTypeName(staff.staffType)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <span className="text-green-600 font-medium">
                          Present: {staff.attendance.present}
                        </span>
                        <span className="text-red-600 font-medium">
                          Absent: {staff.attendance.absent}
                        </span>
                        <span className="text-yellow-600 font-medium">
                          Late: {staff.attendance.late}
                        </span>
                        <span className="font-bold text-gray-900">
                          {staff.attendance.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          staff.attendance.percentage >= 90
                            ? 'bg-green-500'
                            : staff.attendance.percentage >= 75
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${staff.attendance.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Staff Types Tab */}
      {activeTab === 'types' && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Staff Types & Roles</CardTitle>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Add New Type
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {staffTypes.map((type) => {
                  const staffCount = staffList.filter(
                    (s) => s.staffType === type.id
                  ).length;
                  return (
                    <div
                      key={type.id}
                      className="p-6 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center`}>
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{type.name}</h3>
                            <p className="text-sm text-gray-500">{staffCount} staff members</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>• Access to call center dashboard</p>
                        <p>• Can handle customer calls</p>
                        <p>• View personal statistics</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Permissions Matrix */}
          <Card>
            <CardHeader>
              <CardTitle>Permissions Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Permission</th>
                      {staffTypes.map((type) => (
                        <th key={type.id} className="text-center py-3 px-2">
                          {type.name.split(' ')[0]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      'View Dashboard',
                      'Handle Calls',
                      'View All Calls',
                      'Manage Agents',
                      'View Analytics',
                      'Edit Settings',
                      'Manage HR',
                    ].map((permission) => (
                      <tr key={permission} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{permission}</td>
                        {staffTypes.map((type) => (
                          <td key={type.id} className="text-center py-3 px-2">
                            {Math.random() > 0.3 ? (
                              <CheckCircle className="w-5 h-5 text-green-500 inline" />
                            ) : (
                              <XCircle className="w-5 h-5 text-gray-300 inline" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <CardHeader>
              <CardTitle>Add New Staff Member</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="john.doe@education.gov"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    value={newStaff.employeeId}
                    onChange={(e) => setNewStaff({ ...newStaff, employeeId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="EMP007"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="+232 76 123 456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Staff Type *
                  </label>
                  <select 
                    value={newStaff.staffType}
                    onChange={(e) => setNewStaff({ ...newStaff, staffType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select type...</option>
                    {staffTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <select 
                    value={newStaff.department}
                    onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select department...</option>
                    <option value="support">Support</option>
                    <option value="operations">Operations</option>
                    <option value="analytics">Analytics</option>
                    <option value="administration">Administration</option>
                    <option value="hr">Human Resources</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Join Date *
                  </label>
                  <input
                    type="date"
                    value={newStaff.joinDate}
                    onChange={(e) => setNewStaff({ ...newStaff, joinDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select 
                    value={newStaff.status}
                    onChange={(e) => setNewStaff({ ...newStaff, status: e.target.value as 'active' | 'on-leave' | 'inactive' })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="active">Active</option>
                    <option value="on-leave">On Leave</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAddStaffModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddStaff}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Staff
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
