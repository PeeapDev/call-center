'use client';

import { useState, useEffect } from 'react';
import { X, User, Clock, MessageSquare, Phone, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

interface MediaItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  filename: string;
  uploadedAt: string;
}

interface Agent {
  id: string;
  name: string;
  status: string;
  accountType: string;
  extension?: string;
}

export function FlowNodeConfig({ node, onClose, onUpdate }: FlowNodeConfigProps) {
  const [config, setConfig] = useState({
    ...node.data,
    nodeType: node.data?.nodeType || 'default',
    assignedAgents: node.data?.assignedAgents || [],
    conditionValue: node.data?.conditionValue || {},
  });
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [ivrMedia, setIvrMedia] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);

  useEffect(() => {
    fetchStaff();
    fetchIvrMedia(config.ivrArea || 'menu');
    fetchAvailableAgents();
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

  const fetchIvrMedia = async (subcategory?: string) => {
    setLoadingMedia(true);
    try {
      const url = subcategory
        ? buildApiUrl(`/media?category=ivr&subcategory=${subcategory}`)
        : buildApiUrl('/media?category=ivr');
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'ok' && Array.isArray(data.media)) {
        setIvrMedia(data.media);
      }
    } catch (error) {
      console.error('Failed to fetch IVR media:', error);
    } finally {
      setLoadingMedia(false);
    }
  };

  const fetchAvailableAgents = async () => {
    setLoadingAgents(true);
    try {
      const response = await fetch(buildApiUrl('/flow-builder/agents/available'));
      const data = await response.json();
      if (data.status === 'ok' && Array.isArray(data.agents)) {
        setAvailableAgents(data.agents);
      }
    } catch (error) {
      console.error('Failed to fetch available agents:', error);
    } finally {
      setLoadingAgents(false);
    }
  };

  const handleSave = () => {
    // Ensure nodeType is preserved
    const updatedConfig = { ...config, nodeType: config.nodeType || node.data?.nodeType };
    onUpdate(node.id, updatedConfig);
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
      case 'agent':
        return <User className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  const renderConfigFields = () => {
    const type = config.nodeType || node.type || config.type;

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
              <Label>IVR Audio (Media File)</Label>
              <select
                value={config.ivrMediaId || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    ivrMediaId: e.target.value || undefined,
                  })
                }
                className="w-full border rounded-md p-2"
              >
                <option value="">No audio selected (use text prompt only)</option>
                {loadingMedia ? (
                  <option value="" disabled>
                    Loading media...
                  </option>
                ) : (
                  ivrMedia.map((media) => (
                    <option key={media.id} value={media.id}>
                      {media.name}
                    </option>
                  ))
                )}
              </select>
              <p className="text-xs text-gray-500">
                Select a pre-recorded audio file uploaded from Settings &gt; Media Library.
              </p>
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
              <Label>IVR Area</Label>
              <select
                value={config.ivrArea || 'menu'}
                onChange={(e) => {
                  const newArea = e.target.value;
                  setConfig({ ...config, ivrArea: newArea });
                  fetchIvrMedia(newArea); // Fetch media for this area
                }}
                className="w-full border rounded-md p-2"
              >
                <option value="welcome">Welcome Message</option>
                <option value="menu">Main Menu</option>
                <option value="exam">Exam Malpractice</option>
                <option value="teacher">Teacher Issues</option>
                <option value="student">Student Welfare</option>
                <option value="general">General Inquiry</option>
                <option value="operator">Operator Transfer</option>
                <option value="other">Other</option>
              </select>
              <p className="text-xs text-gray-500">
                Select the IVR area to associate audio files with this node.
              </p>
            </div>

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
              <Label>IVR Audio (Media File)</Label>
              <select
                value={config.ivrMediaId || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    ivrMediaId: e.target.value || undefined,
                  })
                }
                className="w-full border rounded-md p-2"
              >
                <option value="">No audio selected (use text prompt only)</option>
                {loadingMedia ? (
                  <option value="" disabled>
                    Loading media...
                  </option>
                ) : (
                  ivrMedia.map((media) => (
                    <option key={media.id} value={media.id}>
                      {media.name} {media.subcategory && `(${media.subcategory})`}
                    </option>
                  ))
                )}
              </select>
              <p className="text-xs text-gray-500">
                Select a pre-recorded audio file uploaded from Settings &gt; Media Library for this IVR area.
              </p>
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

      case 'agent':
        return (
          <>
            <div className="space-y-2">
              <Label>Agent Selection</Label>
              <p className="text-sm text-gray-600">
                Select agents that can handle calls at this point. The system will automatically route to the first available agent.
                If no agents are available, the call will continue to the next node in the flow.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Available Agents</Label>
              <div className="border rounded-lg p-3 max-h-64 overflow-y-auto space-y-2">
                {loadingAgents ? (
                  <p className="text-sm text-gray-500">Loading agents...</p>
                ) : availableAgents.length === 0 ? (
                  <p className="text-sm text-gray-500">No agents available</p>
                ) : (
                  availableAgents.map((agent) => (
                    <label
                      key={agent.id}
                      className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded border"
                    >
                      <input
                        type="checkbox"
                        checked={(config.assignedAgents || []).includes(agent.id)}
                        onChange={(e) => {
                          const current = config.assignedAgents || [];
                          const updated = e.target.checked
                            ? [...current, agent.id]
                            : current.filter((id: string) => id !== agent.id);
                          setConfig({ ...config, assignedAgents: updated });
                        }}
                        className="rounded w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{agent.name}</p>
                          <Badge
                            variant={agent.status === 'available' ? 'default' : 'secondary'}
                            className={`text-xs ${
                              agent.status === 'available'
                                ? 'bg-green-600'
                                : agent.status === 'busy'
                                ? 'bg-red-600'
                                : 'bg-gray-600'
                            }`}
                          >
                            {agent.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {agent.accountType} {agent.extension && `• Ext: ${agent.extension}`}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
              <p className="text-xs text-gray-500">
                Check the agents that should handle calls at this routing point. The system will prioritize available agents.
              </p>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-medium text-blue-900 mb-1">
                💡 How Agent Routing Works
              </p>
              <p className="text-xs text-blue-800 mb-2">
                <strong>Flow Example:</strong>
              </p>
              <p className="text-xs text-blue-800">
                1. <strong>Agent Node</strong> → Checks assigned agents, routes to first available<br/>
                2. <strong>If no agents available</strong> → Connects to <strong>Condition Node</strong><br/>
                3. <strong>Condition Node</strong> → Checks if queue time &gt; 2 minutes<br/>
                4. <strong>If TRUE</strong> → Routes to <strong>Default Agent Node</strong><br/>
                5. <strong>If FALSE</strong> → Routes to <strong>General Queue</strong>
              </p>
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
                value={config.conditionType || 'queue_time'}
                onChange={(e) => setConfig({ ...config, conditionType: e.target.value })}
                className="w-full border rounded-md p-2"
              >
                <option value="agent_available">Agent Availability</option>
                <option value="time_check">Time Check</option>
                <option value="queue_time">Queue Time</option>
                <option value="custom">Custom Condition</option>
              </select>
              <p className="text-sm text-gray-600">
                Choose what condition to evaluate at this step.
              </p>
            </div>

            {config.conditionType === 'agent_available' && (
              <div className="space-y-2">
                <Label>Select Agents to Check</Label>
                <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                  {loadingAgents ? (
                    <p className="text-sm text-gray-500">Loading agents...</p>
                  ) : availableAgents.length === 0 ? (
                    <p className="text-sm text-gray-500">No agents available</p>
                  ) : (
                    availableAgents.map((agent) => (
                      <label
                        key={agent.id}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={(config.conditionValue?.agentIds || []).includes(agent.id)}
                          onChange={(e) => {
                            const current = config.conditionValue?.agentIds || [];
                            const updated = e.target.checked
                              ? [...current, agent.id]
                              : current.filter((id: string) => id !== agent.id);
                            setConfig({
                              ...config,
                              conditionValue: { ...config.conditionValue, agentIds: updated }
                            });
                          }}
                          className="rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{agent.name}</p>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={agent.status === 'available' ? 'default' : 'secondary'}
                              className={`text-xs ${
                                agent.status === 'available'
                                  ? 'bg-green-600'
                                  : agent.status === 'busy'
                                  ? 'bg-red-600'
                                  : 'bg-gray-600'
                              }`}
                            >
                              {agent.status}
                            </Badge>
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Condition passes if at least one of these agents is available.
                </p>
              </div>
            )}

            {config.conditionType === 'time_check' && (
              <div className="space-y-2">
                <Label>Time Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Start Time</Label>
                    <Input
                      type="time"
                      value={config.conditionValue?.startHour ?
                        `${String(config.conditionValue.startHour).padStart(2, '0')}:00` : '09:00'}
                      onChange={(e) => {
                        const hour = parseInt(e.target.value.split(':')[0]);
                        setConfig({
                          ...config,
                          conditionValue: { ...config.conditionValue, startHour: hour }
                        });
                      }}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">End Time</Label>
                    <Input
                      type="time"
                      value={config.conditionValue?.endHour ?
                        `${String(config.conditionValue.endHour).padStart(2, '0')}:00` : '17:00'}
                      onChange={(e) => {
                        const hour = parseInt(e.target.value.split(':')[0]);
                        setConfig({
                          ...config,
                          conditionValue: { ...config.conditionValue, endHour: hour }
                        });
                      }}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Condition passes if current time is within this range.
                </p>
              </div>
            )}

            {config.conditionType === 'queue_time' && (
              <div className="space-y-2">
                <Label>Queue Time Threshold</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={config.conditionValue?.thresholdMinutes || '2'}
                    onChange={(e) => setConfig({
                      ...config,
                      conditionValue: { ...config.conditionValue, thresholdMinutes: parseInt(e.target.value) || 2 }
                    })}
                    min="1"
                    max="60"
                    className="w-20"
                  />
                  <span className="text-sm text-gray-600">minutes</span>
                </div>
                <p className="text-xs text-gray-500">
                  Condition passes if the call has been queuing for at least this many minutes.
                  Use this after an Agent Node to check for long-waiting calls.
                </p>
              </div>
            )}

            {config.conditionType === 'custom' && (
              <div className="space-y-2">
                <Label>Custom Condition</Label>
                <Input
                  value={config.conditionValue?.expression || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    conditionValue: { ...config.conditionValue, expression: e.target.value }
                  })}
                  placeholder="Enter custom condition logic"
                />
                <p className="text-xs text-gray-500">
                  Custom condition evaluation (for advanced use cases).
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Routing Logic</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">If Condition TRUE</Label>
                  <Input
                    value={config.conditionValue?.trueNode || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      conditionValue: { ...config.conditionValue, trueNode: e.target.value }
                    })}
                    placeholder="Next node ID (e.g., agent-node-1)"
                  />
                </div>
                <div>
                  <Label className="text-xs">If Condition FALSE</Label>
                  <Input
                    value={config.conditionValue?.falseNode || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      conditionValue: { ...config.conditionValue, falseNode: e.target.value }
                    })}
                    placeholder="Next node ID (e.g., queue-general)"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Specify which node to route to when the condition passes (TRUE) or fails (FALSE).
              </p>
            </div>

            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs font-medium text-green-900 mb-1">
                🎯 Usage Tip
              </p>
              <p className="text-xs text-green-800">
                Connect this node after an Agent Node. When no agents are available,
                this condition will check queue time and route to fallback options.
              </p>
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
