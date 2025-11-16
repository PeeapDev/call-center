'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, UserPlus, Edit, Trash2, Search, Phone, Key, RefreshCw,
  CheckCircle, XCircle, Copy, Eye, EyeOff
} from 'lucide-react';
import { API_ENDPOINTS, buildApiUrl } from '@/lib/config';

interface User {
  id: string;
  name: string;
  phoneNumber: string;
  accountType: string;
  userCategory?: string;
  extension?: string;
  skills?: string[];
  isActive: boolean;
  sipUsername?: string;
  sipExtension?: string;
  hasSipCredentials?: boolean;
  createdAt: string;
}

export default function HREnhancedPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSIPModal, setShowSIPModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sipCredentials, setSIPCredentials] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    password: '',
    accountType: 'agent',
    userCategory: '',
    skills: [] as string[],
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    console.log('showAddModal state changed:', showAddModal);
  }, [showAddModal]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.hrUsers);
      const data = await response.json();
      if (data.status === 'ok') {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    console.log('handleCreateUser called');
    console.log('Form data:', formData);
    
    if (!formData.name || !formData.phoneNumber || !formData.password) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      console.log('Sending request to:', API_ENDPOINTS.hrUsers);
      const response = await fetch(API_ENDPOINTS.hrUsers, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.status === 'ok') {
        setShowAddModal(false);
        resetForm();
        
        // Don't show SIP modal - agent can view credentials on their dashboard anytime
        alert(`✓ ${data.user.name} created successfully!\n\nAgent can view their WebRTC credentials on their dashboard.`);
        fetchUsers();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('API call failed:', error);
      alert('Failed to create user');
    }
  };

  const handleRegenerateSIP = async (userId: string) => {
    if (!confirm('Regenerate SIP credentials? Old credentials will no longer work.')) return;

    try {
      const response = await fetch(buildApiUrl(`/hr/users/${userId}/regenerate-sip`), {
        method: 'POST',
      });

      const data = await response.json();

      if (data.status === 'ok') {
        setSIPCredentials(data.sipCredentials);
        setShowSIPModal(true);
        fetchUsers();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert('Failed to regenerate credentials');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(buildApiUrl(`/hr/users/${userId}`), {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.status === 'ok') {
        alert('User deleted successfully');
        fetchUsers();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phoneNumber: '',
      password: '',
      accountType: 'agent',
      userCategory: '',
      skills: [],
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.phoneNumber.includes(searchQuery);
    const matchesFilter = filterType === 'all' || user.accountType === filterType;
    return matchesSearch && matchesFilter;
  });

  const agentCount = users.filter(u => u.accountType === 'agent').length;
  const activeCount = users.filter(u => u.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            Human Resources - Agent Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage agents and their WebRTC/SIP credentials
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            console.log('NEW Add Agent button clicked!');
            setShowAddModal(true);
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
        >
          <UserPlus className="w-4 h-4" />
          Add New Agent
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Agents</p>
                <p className="text-3xl font-bold text-gray-900">{agentCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-3xl font-bold text-gray-900">{activeCount}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">With SIP</p>
                <p className="text-3xl font-bold text-gray-900">
                  {users.filter(u => u.hasSipCredentials).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Key className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="admin">Admin</option>
              <option value="supervisor">Supervisor</option>
              <option value="agent">Agent</option>
              <option value="analyst">Analyst</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle>Users & Agents</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Users className="w-16 h-16 mx-auto mb-4" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Extension</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SIP</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">ID: {user.id.substring(0, 8)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.phoneNumber}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="capitalize">
                          {user.accountType}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">
                        {user.sipExtension || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {user.hasSipCredentials ? (
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-700">
                              <Key className="w-3 h-3 mr-1" />
                              Configured
                            </Badge>
                            <Button
                              onClick={() => handleRegenerateSIP(user.id)}
                              variant="ghost"
                              size="sm"
                              title="Regenerate SIP Credentials"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">
                            No SIP
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.isActive ? (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-700">
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ 
            zIndex: 99999, 
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              console.log('Modal backdrop clicked');
              setShowAddModal(false);
              resetForm();
            }
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
              <Card className="border-0">
                <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardTitle>Add New User/Agent</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="text"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+232 76 123 456"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Type *
                      </label>
                      <select
                        value={formData.accountType}
                        onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="agent">Agent (with SIP)</option>
                        <option value="supervisor">Supervisor (with SIP)</option>
                        <option value="admin">Admin (with SIP)</option>
                        <option value="analyst">Analyst</option>
                        <option value="auditor">Auditor</option>
                        <option value="citizen">Citizen</option>
                      </select>
                    </div>
                  </div>

                  {(formData.accountType === 'agent' || formData.accountType === 'supervisor' || formData.accountType === 'admin') && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <Key className="w-4 h-4 inline mr-1" />
                        <strong>SIP credentials will be automatically generated</strong> for this {formData.accountType}.
                        You'll receive the credentials after creation.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        console.log('Create User button clicked!');
                        handleCreateUser();
                      }}
                      style={{
                        flex: 1,
                        padding: '12px 24px',
                        backgroundColor: '#10B981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10B981'}
                    >
                      <UserPlus className="w-4 h-4" />
                      Create User
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        console.log('Cancel button clicked');
                        setShowAddModal(false);
                        resetForm();
                      }}
                      style={{
                        flex: 1,
                        padding: '12px 24px',
                        backgroundColor: 'white',
                        color: '#374151',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      Cancel
                    </button>
                  </div>
                </CardContent>
              </Card>
          </div>
        </div>
      )}

      {/* SIP Credentials Modal */}
      {showSIPModal && sipCredentials && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <Card className="border-0">
                <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-6 h-6 text-green-600" />
                    SIP Credentials Generated
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 font-medium">
                      ⚠️ <strong>SAVE THESE NOW!</strong> This is the only time you'll see the password.
                      <br />
                      Give these credentials to the agent so they can register their WebRTC phone.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs font-medium text-gray-600 mb-1">SIP USERNAME</p>
                      <div className="flex items-center justify-between">
                        <code className="text-sm font-mono text-gray-900">{sipCredentials.username}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(sipCredentials.username)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs font-medium text-gray-600 mb-1">SIP PASSWORD</p>
                      <div className="flex items-center justify-between">
                        <code className="text-sm font-mono text-gray-900">
                          {showPassword ? sipCredentials.password : '••••••••••••••••'}
                        </code>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(sipCredentials.password)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs font-medium text-gray-600 mb-1">EXTENSION</p>
                      <div className="flex items-center justify-between">
                        <code className="text-sm font-mono text-gray-900">{sipCredentials.extension}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(sipCredentials.extension)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Next Steps:</strong>
                      <br />
                      1. Copy these credentials
                      <br />
                      2. Agent goes to <strong>WebRTC Setup</strong> page
                      <br />
                      3. Enter these credentials to register their WebRTC phone
                      <br />
                      4. Start receiving calls!
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowSIPModal(false);
                      setSIPCredentials(null);
                      setShowPassword(false);
                      fetchUsers(); // Refresh the user list
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 24px',
                      backgroundColor: '#10B981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10B981'}
                  >
                    ✓ I've Saved the Credentials - Close
                  </button>
                </CardContent>
              </Card>
          </div>
        </div>
      )}
    </div>
  );
}
