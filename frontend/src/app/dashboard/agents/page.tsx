'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Phone, Clock, TrendingUp, PhoneCall, PhoneOff, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import Script from 'next/script';
import { API_ENDPOINTS } from '@/lib/config';
import { useSession } from 'next-auth/react';

interface Agent {
  id: string;
  name: string;
  phoneNumber: string;
  accountType: string;
  sipUsername?: string;
  sipPassword?: string;
  sipExtension?: string;
  status?: string;
  currentCall?: string;
  callDuration?: string;
  callsToday?: number;
  avgCallTime?: string;
}

interface WebRTCAgent {
  agentId: string;
  ua: any;
  isRegistered: boolean;
  currentSession: any;
}

export default function AgentsPage() {
  const { data: session } = useSession();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [webrtcAgents, setWebrtcAgents] = useState<Map<string, WebRTCAgent>>(new Map());
  const [jssipLoaded, setJssipLoaded] = useState(false);
  const [wsServer, setWsServer] = useState('ws://192.168.1.17:8088/ws');
  
  const user = session?.user as any;
  const userRole = user?.role;
  const canRegisterWebRTC = userRole === 'admin' || userRole === 'supervisor' || userRole === 'agent';

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.hrUsers}?accountType=agent`);
      const data = await response.json();
      if (data.status === 'ok') {
        setAgents(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const onlineAgents = agents.filter((a) => a.status !== 'offline');
  const onCallAgents = agents.filter((a) => a.status === 'on-call');
  const availableAgents = agents.filter((a) => a.status === 'available');
  const webrtcRegisteredCount = Array.from(webrtcAgents.values()).filter(a => a.isRegistered).length;

  const registerAgent = async (agent: Agent) => {
    if (!jssipLoaded) {
      alert('JsSIP library is still loading. Please wait...');
      return;
    }

    try {
      // @ts-ignore - JsSIP is loaded from CDN
      const JsSIP = window.JsSIP;
      
      if (!JsSIP) {
        alert('JsSIP library not loaded. Please refresh the page.');
        return;
      }

      const domain = wsServer.split('/')[2].split(':')[0];
      const socket = new JsSIP.WebSocketInterface(wsServer);

      const configuration = {
        sockets: [socket],
        uri: `sip:${agent.sipUsername}@${domain}`,
        password: agent.sipPassword,
        display_name: agent.name,
        session_timers: false,
        register: true,
        register_expires: 600,
      };

      const ua = new JsSIP.UA(configuration);

      ua.on('registered', () => {
        console.log(`✅ ${agent.name} registered for WebRTC calls`);
        setWebrtcAgents(prev => {
          const newMap = new Map(prev);
          newMap.set(agent.id, {
            agentId: agent.id,
            ua,
            isRegistered: true,
            currentSession: null,
          });
          return newMap;
        });
      });

      ua.on('registrationFailed', (e: any) => {
        console.error(`❌ ${agent.name} registration failed:`, e.cause);
        alert(`Registration failed for ${agent.name}: ${e.cause}`);
      });

      ua.on('newRTCSession', (data: any) => {
        const session = data.session;
        
        if (session.direction === 'incoming') {
          console.log(`📞 Incoming call for ${agent.name}`);
          
          // Auto-answer or show notification
          const shouldAnswer = confirm(`Incoming call for ${agent.name}. Answer?`);
          
          if (shouldAnswer) {
            session.answer({
              mediaConstraints: { audio: true, video: false }
            });
            
            setWebrtcAgents(prev => {
              const newMap = new Map(prev);
              const agentData = newMap.get(agent.id);
              if (agentData) {
                agentData.currentSession = session;
                newMap.set(agent.id, agentData);
              }
              return newMap;
            });
          } else {
            session.terminate();
          }
        }
      });

      ua.start();
    } catch (error: any) {
      console.error('Registration error:', error);
      alert(`Failed to register ${agent.name}: ${error.message}`);
    }
  };

  const unregisterAgent = (agentId: string) => {
    const webrtcAgent = webrtcAgents.get(agentId);
    if (webrtcAgent && webrtcAgent.ua) {
      webrtcAgent.ua.stop();
      setWebrtcAgents(prev => {
        const newMap = new Map(prev);
        newMap.delete(agentId);
        return newMap;
      });
    }
  };

  const isAgentRegistered = (agentId: string): boolean => {
    return webrtcAgents.get(agentId)?.isRegistered ?? false;
  };

  return (
    <>
      <Script 
        src="https://cdn.jsdelivr.net/npm/jssip@3.10.1/dist/jssip.min.js"
        onLoad={() => {
          setJssipLoaded(true);
          console.log('✅ JsSIP library loaded');
        }}
      />
      
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agent Management</h1>
            <p className="text-gray-500 mt-1">Manage agents, monitor calls, and configure WebRTC</p>
          </div>
          <Button>Add Agent</Button>
        </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.length}</div>
            <p className="text-xs text-muted-foreground">
              {onlineAgents.length} online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Call</CardTitle>
            <Phone className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {onCallAgents.length}
            </div>
            <p className="text-xs text-muted-foreground">Currently handling calls</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {availableAgents.length}
            </div>
            <p className="text-xs text-muted-foreground">Ready for calls</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4:12</div>
            <p className="text-xs text-muted-foreground">Avg call duration</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WebRTC Registered</CardTitle>
            <PhoneCall className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {webrtcRegisteredCount}
            </div>
            <p className="text-xs text-muted-foreground">Ready to receive calls</p>
          </CardContent>
        </Card>
      </div>

      {/* WebRTC Configuration */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-purple-600" />
            WebRTC Agent Registration
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Register agents to receive calls from mobile users via WebRTC. Click the "Register" button for each agent.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-32">Asterisk Server:</label>
            <input
              type="text"
              value={wsServer}
              onChange={(e) => setWsServer(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md text-sm"
              placeholder="ws://192.168.1.17:8088/ws"
            />
            <Badge variant={jssipLoaded ? "default" : "secondary"}>
              {jssipLoaded ? "JsSIP Loaded" : "Loading..."}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Agents List */}
      <Card>
        <CardHeader>
          <CardTitle>All Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading agents...</div>
            ) : agents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">No agents found</p>
                <p className="text-sm text-gray-400">Add agents in the HR Management page</p>
              </div>
            ) : (
              agents.map((agent) => {
              const isRegistered = isAgentRegistered(agent.id);
              return (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                      {agent.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-gray-900">{agent.name}</p>
                        <Badge
                          variant={
                            agent.status === 'on-call'
                              ? 'default'
                              : agent.status === 'available'
                                ? 'secondary'
                                : 'outline'
                          }
                          className={
                            agent.status === 'on-call'
                              ? 'bg-green-500'
                              : agent.status === 'available'
                                ? 'bg-blue-500'
                                : ''
                          }
                        >
                          {agent.status}
                        </Badge>
                        {isRegistered && (
                          <Badge className="bg-purple-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            WebRTC Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{agent.phoneNumber}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        SIP: {agent.sipUsername || 'Not configured'} • Ext: {agent.sipExtension || 'N/A'}
                      </p>
                      {agent.currentCall && (
                        <p className="text-sm text-green-600 font-medium mt-1">
                          📞 On call with {agent.currentCall} • {agent.callDuration}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {agent.callsToday || 0}
                      </p>
                      <p className="text-xs text-gray-500">Calls today</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">
                        {agent.avgCallTime || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">Avg duration</p>
                    </div>
                    {canRegisterWebRTC && (
                      <>
                        {isRegistered ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => unregisterAgent(agent.id)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <PhoneOff className="w-4 h-4 mr-2" />
                            Unregister
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => registerAgent(agent)}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <PhoneCall className="w-4 h-4 mr-2" />
                            Register WebRTC
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
