'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Server, Database, Bell, Shield, Users, Key, Eye, EyeOff, Save, Brain } from 'lucide-react';
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
      const response = await fetch('http://localhost:3001/ai-keys');
      const data = await response.json();
      if (data.status === 'ok') {
        setApiKeys(data.keys);
      }
    } catch (error) {
      console.error('Failed to fetch AI keys:', error);
    }
  };

  const handleUpdateKey = async (keyName: string) => {
    try {
      const response = await fetch(`http://localhost:3001/ai-keys/${keyName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: keyValues[keyName] || '' }),
      });
      const data = await response.json();
      
      if (data.status === 'ok') {
        alert('AI key updated successfully!');
        setEditingKey(null);
        setKeyValues((prev) => ({ ...prev, [keyName]: '' }));
        fetchApiKeys();
      } else {
        alert(`Failed to update AI key: ${data.message}`);
      }
    } catch (error) {
      alert('Failed to update AI key');
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

      {/* Grid Layout for Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Backend API</p>
                  <p className="text-sm text-gray-500">NestJS</p>
                </div>
                <Badge variant={backendHealth ? 'default' : 'destructive'}>
                  {backendHealth ? 'Online' : 'Offline'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Asterisk PBX</p>
                  <p className="text-sm text-gray-500">Call System</p>
                </div>
                <Badge
                  variant={
                    backendHealth?.asterisk?.ariConnected ? 'default' : 'secondary'
                  }
                >
                  {backendHealth?.asterisk?.ariConnected ? 'Connected' : 'Mock Mode'}
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
          </CardContent>
        </Card>

        {/* AI Keys Management - Full width */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Keys Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Manage AI provider keys for chatbot and analytics. These keys are encrypted and stored securely.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <p className="text-xs text-gray-500">{apiKey.description}</p>
                    </div>
                  </div>

                  {editingKey === apiKey.name ? (
                    <div className="space-y-2">
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
                            className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                          <button
                            onClick={() =>
                              setShowKey((prev) => ({
                                ...prev,
                                [apiKey.name]: !prev[apiKey.name],
                              }))
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
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
                          <Save className="w-3 h-3 mr-1" />
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
                    <div className="flex items-center justify-between">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 mr-2">
                        {apiKey.masked || '••••••••••••••••'}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingKey(apiKey.name)}
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-medium text-blue-900 mb-1">
                🔐 Supported AI Providers
              </p>
              <p className="text-xs text-blue-800">
                Google Gemini, DeepSeek, OpenAI, Anthropic Claude, and more. Keys are encrypted at rest.
              </p>
            </div>
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
          <CardContent className="space-y-3">
            <div className="space-y-3">
              <div>
                <p className="font-medium text-sm text-gray-900 mb-1">ARI URL</p>
                <code className="text-xs bg-gray-100 px-3 py-1.5 rounded block">
                  http://localhost:8088/ari
                </code>
              </div>

              <div>
                <p className="font-medium text-sm text-gray-900 mb-1">AMI Port</p>
                <code className="text-xs bg-gray-100 px-3 py-1.5 rounded block">5038</code>
              </div>

              <div className="flex items-center justify-between">
                <p className="font-medium text-sm text-gray-900">WebRTC</p>
                <Badge variant="secondary">Not Configured</Badge>
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full">
              Reconnect to Asterisk
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Call Alerts', desc: 'Notify when calls waiting', checked: true },
              { label: 'Recording Complete', desc: 'Recording ready', checked: true },
              { label: 'AI Transcription', desc: 'Transcription complete', checked: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked={item.checked} />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
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
          <CardContent className="space-y-3">
            {[
              { label: 'Authentication', desc: 'OAuth/OIDC via Keycloak' },
              { label: 'Role-Based Access', desc: 'Admin, Agent, Citizen, etc.' },
              { label: 'Audit Logging', desc: 'Track all system actions' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <Badge variant="secondary">Pending</Badge>
              </div>
            ))}
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
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              User management and role assignment will be available once authentication is configured.
            </p>
            <Button variant="outline" size="sm" disabled className="w-full">
              Configure Authentication
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
