'use client';

import { useState, useEffect } from 'react';
import { X, User, Clock, MessageSquare, Phone, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { buildApiUrl } from '@/lib/config';

interface FlowNodeConfigProps {
  node: any;
  onClose: () => void;
  onUpdate: (nodeId: string, data: any) => void;
}

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  extension?: string;
}

export function FlowNodeConfig({ node, onClose, onUpdate }: FlowNodeConfigProps) {
  const [config, setConfig] = useState(node.data || {});
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch(buildApiUrl('/hr/users'));
      const data = await response.json();
      if (data.status === 'ok') {
        // Filter for agents and supervisors
        const agentStaff = data.users.filter((u: any) => 
          u.role === 'agent' || u.role === 'supervisor'
        );
        setStaffList(agentStaff);
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    onUpdate(node.id, config);
    onClose();
  };

  const getNodeIcon = () => {
    const type = node.type || config.type;
    switch (type) {
      case 'queue':
        return <Phone className="w-5 h-5" />;
      case 'ivr':
        return <MessageSquare className="w-5 h-5" />;
      case 'time':
        return <Clock className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  const renderConfigFields = () => {
    const type = node.type || config.type;

    switch (type) {
      case 'queue':
        return (
          <>
            <div className="space-y-2">
              <Label>Queue Name</Label>
              <Input
                value={config.queueName || ''}
                onChange={(e) => setConfig({ ...config, queueName: e.target.value })}
                placeholder="e.g., Technical Support"
              />
            </div>

            <div className="space-y-2">
              <Label>Assign Staff Members</Label>
              <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                {loading ? (
                  <p className="text-sm text-gray-500">Loading staff...</p>
                ) : staffList.length === 0 ? (
                  <p className="text-sm text-gray-500">No staff available</p>
                ) : (
                  staffList.map((staff) => (
                    <label key={staff.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={(config.assignedStaff || []).includes(staff.id)}
                        onChange={(e) => {
                          const current = config.assignedStaff || [];
                          const updated = e.target.checked
                            ? [...current, staff.id]
                            : current.filter((id: string) => id !== staff.id);
                          setConfig({ ...config, assignedStaff: updated });
                        }}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{staff.name}</p>
                        <p className="text-xs text-gray-500">
                          {staff.role} {staff.extension && `• Ext: ${staff.extension}`}
                        </p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Max Wait Time (minutes)</Label>
              <Input
                type="number"
                value={config.maxWaitTime || '5'}
                onChange={(e) => setConfig({ ...config, maxWaitTime: e.target.value })}
                min="1"
                max="60"
              />
            </div>

            <div className="space-y-2">
              <Label>Priority Level</Label>
              <select
                value={config.priority || 'normal'}
                onChange={(e) => setConfig({ ...config, priority: e.target.value })}
                className="w-full border rounded-md p-2"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </>
        );

      case 'ivr':
        return (
          <>
            <div className="space-y-2">
              <Label>IVR Message</Label>
              <Textarea
                value={config.message || ''}
                onChange={(e) => setConfig({ ...config, message: e.target.value })}
                placeholder="Welcome message or menu options..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Menu Options</Label>
              <div className="space-y-2">
                {[1, 2, 3, 4].map((num) => (
                  <div key={num} className="flex gap-2">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded flex items-center justify-center font-bold">
                      {num}
                    </div>
                    <Input
                      value={config[`option${num}`] || ''}
                      onChange={(e) => setConfig({ ...config, [`option${num}`]: e.target.value })}
                      placeholder={`Option ${num} label`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Timeout (seconds)</Label>
              <Input
                type="number"
                value={config.timeout || '10'}
                onChange={(e) => setConfig({ ...config, timeout: e.target.value })}
                min="5"
                max="60"
              />
            </div>
          </>
        );

      case 'time':
        return (
          <>
            <div className="space-y-2">
              <Label>Office Hours</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Start Time</Label>
                  <Input
                    type="time"
                    value={config.startTime || '09:00'}
                    onChange={(e) => setConfig({ ...config, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">End Time</Label>
                  <Input
                    type="time"
                    value={config.endTime || '17:00'}
                    onChange={(e) => setConfig({ ...config, endTime: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Working Days</Label>
              <div className="flex flex-wrap gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <label key={day} className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(config.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']).includes(day)}
                      onChange={(e) => {
                        const current = config.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                        const updated = e.target.checked
                          ? [...current, day]
                          : current.filter((d: string) => d !== day);
                        setConfig({ ...config, workingDays: updated });
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{day}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Timezone</Label>
              <select
                value={config.timezone || 'Africa/Freetown'}
                onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
                className="w-full border rounded-md p-2"
              >
                <option value="Africa/Freetown">Africa/Freetown (GMT)</option>
                <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                <option value="Africa/Cairo">Africa/Cairo (EET)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </>
        );

      case 'voicemail':
        return (
          <>
            <div className="space-y-2">
              <Label>Voicemail Greeting</Label>
              <Textarea
                value={config.greeting || ''}
                onChange={(e) => setConfig({ ...config, greeting: e.target.value })}
                placeholder="Thank you for calling. Please leave a message..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Email Notifications</Label>
              <Input
                type="email"
                value={config.notifyEmail || ''}
                onChange={(e) => setConfig({ ...config, notifyEmail: e.target.value })}
                placeholder="admin@ministry.gov.sl"
              />
            </div>

            <div className="space-y-2">
              <Label>Max Recording Length (seconds)</Label>
              <Input
                type="number"
                value={config.maxLength || '120'}
                onChange={(e) => setConfig({ ...config, maxLength: e.target.value })}
                min="30"
                max="300"
              />
            </div>
          </>
        );

      case 'condition':
        return (
          <>
            <div className="space-y-2">
              <Label>Condition Type</Label>
              <select
                value={config.conditionType || 'caller_id'}
                onChange={(e) => setConfig({ ...config, conditionType: e.target.value })}
                className="w-full border rounded-md p-2"
              >
                <option value="caller_id">Caller ID</option>
                <option value="time">Time of Day</option>
                <option value="queue_length">Queue Length</option>
                <option value="agent_available">Agent Availability</option>
                <option value="custom">Custom Variable</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Condition Value</Label>
              <Input
                value={config.conditionValue || ''}
                onChange={(e) => setConfig({ ...config, conditionValue: e.target.value })}
                placeholder="Enter condition criteria..."
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={config.description || ''}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                placeholder="Describe what this condition checks..."
                rows={2}
              />
            </div>
          </>
        );

      default:
        return (
          <>
            <div className="space-y-2">
              <Label>Node Label</Label>
              <Input
                value={config.label || ''}
                onChange={(e) => setConfig({ ...config, label: e.target.value })}
                placeholder="Enter node label..."
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={config.description || ''}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                placeholder="Describe this step..."
                rows={3}
              />
            </div>
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {getNodeIcon()}
            </div>
            <div>
              <CardTitle className="text-lg">Configure Node</CardTitle>
              <p className="text-sm text-gray-500">Node ID: {node.id}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto py-4 space-y-4">
          {renderConfigFields()}
        </CardContent>

        <div className="border-t p-4 flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            <Settings className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </Card>
    </div>
  );
}
