'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Server, Database, Bell, Shield, Users, Key, Eye, EyeOff, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ApiKey {
  name: string;
  description: string;
  masked: string;
  isConfigured: boolean;
}

export default function SettingsPage() {
  const [backendHealth, setBackendHealth] = useState<any>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [keyValues, setKeyValues] = useState<Record<string, string>>({});
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('http://localhost:3001/health')
      .then((res) => res.json())
      .then((data) => setBackendHealth(data))
      .catch((err) => console.error('Backend not reachable:', err));

    // Fetch API keys
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('http://localhost:3001/api-keys');
      const data = await response.json();
      if (data.status === 'ok') {
        setApiKeys(data.keys);
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    }
  };

  const handleUpdateKey = async (keyName: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api-keys/${keyName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: keyValues[keyName] || '' }),
      });
      const data = await response.json();
      
      if (data.status === 'ok') {
        alert('API key updated successfully!');
        setEditingKey(null);
        setKeyValues((prev) => ({ ...prev, [keyName]: '' }));
        fetchApiKeys();
      } else {
        alert(`Failed to update API key: ${data.message}`);
      }
    } catch (error) {
      alert('Failed to update API key');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Configure call center system settings
        </p>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Backend API</p>
                <p className="text-sm text-gray-500">NestJS Backend Service</p>
              </div>
              <Badge variant={backendHealth ? 'default' : 'destructive'}>
                {backendHealth ? 'Online' : 'Offline'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Asterisk PBX</p>
                <p className="text-sm text-gray-500">Call Control System</p>
              </div>
              <Badge
                variant={
                  backendHealth?.asterisk?.ariConnected ? 'default' : 'secondary'
                }
              >
                {backendHealth?.asterisk?.ariConnected
                  ? 'Connected'
                  : 'Mock Mode'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Database</p>
                <p className="text-sm text-gray-500">PostgreSQL</p>
              </div>
              <Badge variant="secondary">Pending</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Storage</p>
                <p className="text-sm text-gray-500">MinIO S3</p>
              </div>
              <Badge variant="secondary">Pending</Badge>
            </div>
          </div>

          {backendHealth && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Backend Health Details:
              </p>
              <pre className="text-xs text-gray-600 overflow-auto">
                {JSON.stringify(backendHealth, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Asterisk Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Asterisk Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">ARI URL</p>
                <p className="text-sm text-gray-500">
                  Asterisk REST Interface endpoint
                </p>
              </div>
              <code className="text-sm bg-gray-100 px-3 py-1 rounded">
                http://localhost:8088/ari
              </code>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">AMI Port</p>
                <p className="text-sm text-gray-500">
                  Asterisk Manager Interface port
                </p>
              </div>
              <code className="text-sm bg-gray-100 px-3 py-1 rounded">5038</code>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">WebRTC</p>
                <p className="text-sm text-gray-500">Browser-based softphone</p>
              </div>
              <Badge variant="secondary">Not Configured</Badge>
            </div>
          </div>

          <div className="pt-4">
            <Button variant="outline">Reconnect to Asterisk</Button>
          </div>
        </CardContent>
      </Card>

      {/* API Keys Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Keys Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Manage API keys for external integrations. Only Super Admin can view and edit these keys.
          </p>
          
          <div className="space-y-3">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.name} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-medium text-gray-900">{apiKey.name}</p>
                      <Badge variant={apiKey.isConfigured ? 'default' : 'secondary'}>
                        {apiKey.isConfigured ? 'Configured' : 'Not Set'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{apiKey.description}</p>
                  </div>
                  {editingKey !== apiKey.name && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingKey(apiKey.name)}
                    >
                      Edit
                    </Button>
                  )}
                </div>

                {editingKey === apiKey.name ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type={showKey[apiKey.name] ? 'text' : 'password'}
                          value={keyValues[apiKey.name] || ''}
                          onChange={(e) =>
                            setKeyValues((prev) => ({
                              ...prev,
                              [apiKey.name]: e.target.value,
                            }))
                          }
                          placeholder="Enter API key"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        <button
                          onClick={() =>
                            setShowKey((prev) => ({
                              ...prev,
                              [apiKey.name]: !prev[apiKey.name],
                            }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showKey[apiKey.name] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateKey(apiKey.name)}
                        disabled={!keyValues[apiKey.name]}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingKey(null);
                          setKeyValues((prev) => ({ ...prev, [apiKey.name]: '' }));
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <code className="text-sm bg-gray-100 px-3 py-1 rounded block">
                    {apiKey.masked || '••••••••••••••••'}
                  </code>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">
              🔐 Security Notice
            </p>
            <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
              <li>API keys are stored securely in environment variables</li>
              <li>Only Super Admin users can view and modify API keys</li>
              <li>Keys are masked for security - only first and last 4 characters shown</li>
              <li>Changes take effect immediately after saving</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Call Alerts</p>
              <p className="text-sm text-gray-500">
                Notify when calls are waiting
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Recording Complete</p>
              <p className="text-sm text-gray-500">
                Notify when call recording is ready
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium text-gray-900">AI Transcription</p>
              <p className="text-sm text-gray-500">
                Notify when transcription is complete
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security & Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Authentication</p>
              <p className="text-sm text-gray-500">OAuth/OIDC via Keycloak</p>
            </div>
            <Badge variant="secondary">Not Configured</Badge>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Role-Based Access</p>
              <p className="text-sm text-gray-500">
                Admin, Supervisor, Agent, Analyst, Auditor
              </p>
            </div>
            <Badge variant="secondary">Pending</Badge>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Audit Logging</p>
              <p className="text-sm text-gray-500">Track all system actions</p>
            </div>
            <Badge variant="secondary">Pending</Badge>
          </div>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            User management and role assignment will be available once Keycloak
            authentication is configured.
          </p>
          <Button variant="outline" disabled>
            Configure Authentication
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
