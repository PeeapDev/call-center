'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GitBranch,
  Plus,
  Edit,
  Trash2,
  Play,
  Clock,
  Users,
  Phone,
  ArrowRight,
  Settings,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface RoutingRule {
  id: string;
  name: string;
  priority: number;
  conditions: string[];
  destination: string;
  destinationType: 'queue' | 'agent' | 'ivr' | 'voicemail';
  enabled: boolean;
  callsRouted: number;
}

const API_BASE = 'http://localhost:3001';

export default function CallRoutingPage() {
  const [rules, setRules] = useState<RoutingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatorResult, setSimulatorResult] = useState<any>(null);

  // Fetch routing rules from backend
  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await fetch(`${API_BASE}/routing`);
      if (res.ok) {
        const data = await res.json();
        setRules(data);
      }
    } catch (error) {
      console.error('Failed to fetch rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedRules = async () => {
    try {
      const res = await fetch(`${API_BASE}/routing/seed`, { method: 'POST' });
      if (res.ok) {
        alert('Default routing rules created successfully!');
        fetchRules();
      }
    } catch (error) {
      console.error('Failed to seed rules:', error);
      alert('Failed to create default rules');
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/routing/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Rule deleted successfully!');
        fetchRules();
      }
    } catch (error) {
      console.error('Failed to delete rule:', error);
      alert('Failed to delete rule');
    }
  };

  const handleSimulateCall = async (callerNumber: string, ivrOption: string, time: string) => {
    try {
      const res = await fetch(
        `${API_BASE}/routing/simulate?callerNumber=${encodeURIComponent(callerNumber)}&ivrOption=${ivrOption}&callTime=${time}`
      );
      if (res.ok) {
        const result = await res.json();
        setSimulatorResult(result);
      }
    } catch (error) {
      console.error('Simulation failed:', error);
      alert('Failed to simulate routing');
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Call Routing Configuration</h1>
            <p className="text-gray-500 mt-1">
              Configure intelligent call routing rules for your contact center
            </p>
          </div>
          <div className="flex gap-3">
            {rules.length === 0 && !loading && (
              <Button
                onClick={handleSeedRules}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Settings className="w-4 h-4" />
                Create Default Rules
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowSimulator(!showSimulator)}
              className="flex items-center gap-2"
              disabled={rules.length === 0}
            >
              <Play className="w-4 h-4" />
              Test Routing
            </Button>
            <Button 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              disabled={true}
              title="Coming soon"
            >
              <Plus className="w-4 h-4" />
              New Rule
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Call Simulator */}
      {showSimulator && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-purple-600" />
                Call Routing Simulator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Caller Number
                  </label>
                  <input
                    id="callerNumber"
                    type="text"
                    placeholder="+232 76 123 456"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    IVR Option
                  </label>
                  <select
                    id="ivrOption"
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="1">1 - Exam Issues</option>
                    <option value="2">2 - Teacher Complaints</option>
                    <option value="3">3 - General Inquiry</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Time of Call
                  </label>
                  <input
                    id="callTime"
                    type="time"
                    defaultValue="14:00"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      const caller = (document.getElementById('callerNumber') as HTMLInputElement)
                        ?.value || '+232 76 123 456';
                      const ivr = (document.getElementById('ivrOption') as HTMLSelectElement)
                        ?.value || '1';
                      const time = (document.getElementById('callTime') as HTMLInputElement)
                        ?.value || '14:00';
                      handleSimulateCall(caller, ivr, time);
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Simulate Call
                  </Button>
                </div>
              </div>

              {simulatorResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 p-4 bg-white rounded-lg border-2 border-green-200"
                >
                  <h3 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Routing Result
                  </h3>
                  <div className="space-y-3">
                    {simulatorResult.route.map((step: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-700">{step}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm">
                      <strong className="text-green-700">Final Destination:</strong>{' '}
                      {simulatorResult.destination}
                    </p>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Routing Rules */}
      <div className="space-y-4">
        {rules
          .sort((a, b) => a.priority - b.priority)
          .map((rule, idx) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              whileHover={{ scale: 1.01, x: 5 }}
            >
              <Card
                className={`border-l-4 ${
                  rule.priority === 0
                    ? 'border-l-red-500 bg-red-50'
                    : rule.enabled
                      ? 'border-l-green-500 bg-white'
                      : 'border-l-gray-300 bg-gray-50'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{rule.name}</h3>
                        <Badge
                          variant={rule.enabled ? 'default' : 'secondary'}
                          className={rule.enabled ? 'bg-green-500' : ''}
                        >
                          {rule.enabled ? 'Active' : 'Disabled'}
                        </Badge>
                        <Badge variant="outline">
                          Priority: {rule.priority === 0 ? 'HIGHEST' : rule.priority}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Conditions:</p>
                          <ul className="space-y-1">
                            {rule.conditions.map((condition, idx) => (
                              <li
                                key={idx}
                                className="text-sm text-gray-600 flex items-center gap-2"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                {condition}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Routes To:</p>
                          <div className="flex items-center gap-2">
                            {rule.destinationType === 'queue' && (
                              <Users className="w-4 h-4 text-blue-600" />
                            )}
                            {rule.destinationType === 'agent' && (
                              <Phone className="w-4 h-4 text-green-600" />
                            )}
                            {rule.destinationType === 'voicemail' && (
                              <Clock className="w-4 h-4 text-orange-600" />
                            )}
                            <span className="text-sm font-medium text-gray-900">
                              {rule.destination}
                            </span>
                          </div>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {rule.destinationType}
                          </Badge>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Performance:</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {rule.callsRouted}
                          </p>
                          <p className="text-xs text-gray-500">calls routed</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm" disabled title="Coming soon">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteRule(rule.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <GitBranch className="w-8 h-8 mb-2" />
            <p className="text-3xl font-bold">{rules.length}</p>
            <p className="text-sm text-blue-100">Active Rules</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <Phone className="w-8 h-8 mb-2" />
            <p className="text-3xl font-bold">
              {rules.reduce((sum, r) => sum + r.callsRouted, 0)}
            </p>
            <p className="text-sm text-green-100">Total Calls Routed</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <Settings className="w-8 h-8 mb-2" />
            <p className="text-3xl font-bold">97%</p>
            <p className="text-sm text-purple-100">Routing Accuracy</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <Clock className="w-8 h-8 mb-2" />
            <p className="text-3xl font-bold">2.3s</p>
            <p className="text-sm text-orange-100">Avg Routing Time</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
