'use client';

import { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Save,
  Play,
  Plus,
  Download,
  Upload,
  Trash2,
  Phone,
  Users,
  MessageSquare,
  GitBranch,
  Clock,
  Voicemail,
  PhoneOff,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { initializeDefaultTemplates } from '@/lib/defaultFlowTemplates';

const nodeTypes = [
  { type: 'start', label: 'Start Call', icon: Phone, color: 'bg-green-500' },
  { type: 'ivr', label: 'IVR Menu', icon: MessageSquare, color: 'bg-blue-500' },
  { type: 'queue', label: 'Queue', icon: Users, color: 'bg-purple-500' },
  { type: 'condition', label: 'Condition', icon: GitBranch, color: 'bg-orange-500' },
  { type: 'voicemail', label: 'Voicemail', icon: Voicemail, color: 'bg-gray-500' },
  { type: 'hangup', label: 'Hang Up', icon: PhoneOff, color: 'bg-red-500' },
  { type: 'time', label: 'Time Check', icon: Clock, color: 'bg-yellow-500' },
];

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { 
      label: (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          <span>Incoming Call</span>
        </div>
      ) 
    },
    position: { x: 250, y: 25 },
    sourcePosition: 'bottom' as any,
    targetPosition: 'top' as any,
    style: {
      background: '#10b981',
      color: 'white',
      border: '2px solid #059669',
      borderRadius: '8px',
      padding: '12px 16px',
      fontWeight: 'bold',
      minWidth: '150px',
    },
  },
];

const initialEdges: Edge[] = [];

export default function CallFlowBuilderPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null);
  const [flowName, setFlowName] = useState('Ministry Call Flow');
  const [savedFlows, setSavedFlows] = useState<any[]>([]);

  useEffect(() => {
    // Initialize default templates and load saved flows
    const flows = initializeDefaultTemplates();
    setSavedFlows(flows);
  }, []);

  const onConnect = useCallback(
    (params: Connection | Edge) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: '#3b82f6', strokeWidth: 2 },
          },
          eds
        )
      ),
    [setEdges]
  );

  const addNode = (type: string, label: string, color: string) => {
    const colorMap: Record<string, string> = {
      'bg-green-500': '#10b981',
      'bg-blue-500': '#3b82f6',
      'bg-purple-500': '#a855f7',
      'bg-orange-500': '#f97316',
      'bg-gray-500': '#6b7280',
      'bg-red-500': '#ef4444',
      'bg-yellow-500': '#eab308',
    };

    const newNode: Node = {
      id: `${nodes.length + 1}`,
      type: type === 'start' ? 'input' : type === 'hangup' ? 'output' : 'default',
      data: { 
        label: (
          <div className="flex items-center gap-2">
            {nodeTypes.find(t => t.type === type)?.icon && 
              (() => {
                const Icon = nodeTypes.find(t => t.type === type)!.icon;
                return <Icon className="w-4 h-4" />;
              })()
            }
            <span>{label}</span>
          </div>
        ),
        nodeType: type,
      },
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      },
      sourcePosition: 'bottom' as any,
      targetPosition: 'top' as any,
      style: {
        background: colorMap[color] || '#3b82f6',
        color: 'white',
        border: '2px solid rgba(0,0,0,0.1)',
        borderRadius: '8px',
        padding: '12px 16px',
        fontWeight: '500',
        minWidth: '150px',
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setSelectedNodeType(null);
  };

  const saveFlow = () => {
    const flow = {
      id: Date.now().toString(),
      name: flowName,
      nodes,
      edges,
      createdAt: new Date().toISOString(),
    };
    const flows = [...savedFlows, flow];
    setSavedFlows(flows);
    localStorage.setItem('callFlows', JSON.stringify(flows));
    alert('Call flow saved successfully!');
  };

  const loadFlow = (flow: any) => {
    setNodes(flow.nodes);
    setEdges(flow.edges);
    setFlowName(flow.name);
  };

  const deleteFlow = (id: string) => {
    const flows = savedFlows.filter(f => f.id !== id);
    setSavedFlows(flows);
    localStorage.setItem('callFlows', JSON.stringify(flows));
  };

  const exportFlow = () => {
    const flowData = {
      name: flowName,
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(flowData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${flowName.replace(/\s+/g, '_')}_flow.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const clearFlow = () => {
    if (confirm('Are you sure you want to clear the flow?')) {
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  };

  const generateAsteriskDialplan = () => {
    let dialplan = `;
; Auto-generated from Call Flow Builder: ${flowName}
; Generated at: ${new Date().toISOString()}
;

[call-flow-${flowName.toLowerCase().replace(/\s+/g, '-')}]
`;

    // Simple conversion - in production, this would be more sophisticated
    nodes.forEach((node) => {
      const nodeType = node.data.nodeType || 'default';
      
      if (nodeType === 'ivr') {
        dialplan += `exten => s,1,NoOp(IVR Menu)\n`;
        dialplan += `same => n,Background(custom/menu)\n`;
        dialplan += `same => n,WaitExten(10)\n\n`;
      } else if (nodeType === 'queue') {
        dialplan += `exten => _X.,1,NoOp(Queue: ${node.data.label})\n`;
        dialplan += `same => n,Queue(general,t)\n`;
        dialplan += `same => n,Hangup()\n\n`;
      } else if (nodeType === 'voicemail') {
        dialplan += `exten => _X.,1,NoOp(Voicemail)\n`;
        dialplan += `same => n,VoiceMail(100@default)\n`;
        dialplan += `same => n,Hangup()\n\n`;
      }
    });

    const blob = new Blob([dialplan], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${flowName.replace(/\s+/g, '_')}_extensions.conf`;
    link.click();
  };

  return (
    <div className="space-y-6 h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Call Flow Builder</h1>
            <p className="text-gray-500 mt-1">
              Design your call routing with visual drag-and-drop interface
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              className="px-4 py-2 border rounded-lg font-semibold"
              placeholder="Flow name"
            />
            <Button onClick={saveFlow} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button onClick={exportFlow} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
            <Button onClick={generateAsteriskDialplan} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Dialplan
            </Button>
            <Button onClick={clearFlow} variant="outline" className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-250px)]">
        {/* Toolbox */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="col-span-2"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">Node Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {nodeTypes.map((nodeType) => {
                const Icon = nodeType.icon;
                return (
                  <Button
                    key={nodeType.type}
                    onClick={() => addNode(nodeType.type, nodeType.label, nodeType.color)}
                    variant="outline"
                    className={`w-full justify-start ${nodeType.color} text-white hover:opacity-80 border-0`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {nodeType.label}
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="col-span-7"
        >
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
              >
                <Controls />
                <MiniMap
                  nodeColor={(node) => {
                    return node.style?.background?.toString() || '#3b82f6';
                  }}
                />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
              </ReactFlow>
            </CardContent>
          </Card>
        </motion.div>

        {/* Saved Flows */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="col-span-3"
        >
          <Card className="h-full overflow-auto">
            <CardHeader>
              <CardTitle className="text-sm">Saved Flows</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {savedFlows.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No saved flows yet
                </p>
              ) : (
                savedFlows.map((flow) => (
                  <div
                    key={flow.id}
                    className="p-3 border rounded-lg hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm">{flow.name}</h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteFlow(flow.id)}
                        className="h-6 w-6 p-0 text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {flow.nodes.length} nodes
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {flow.edges.length} connections
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      {new Date(flow.createdAt).toLocaleString()}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => loadFlow(flow)}
                      className="w-full"
                      variant="outline"
                    >
                      Load Flow
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <strong className="text-blue-900">1. Add Nodes:</strong>
                <p className="text-blue-800">Click node types on the left to add them to canvas</p>
              </div>
              <div>
                <strong className="text-blue-900">2. Connect:</strong>
                <p className="text-blue-800">Drag from one node to another to create connections</p>
              </div>
              <div>
                <strong className="text-blue-900">3. Save:</strong>
                <p className="text-blue-800">Save your flow to reuse later or export as JSON/dialplan</p>
              </div>
              <div>
                <strong className="text-blue-900">4. Deploy:</strong>
                <p className="text-blue-800">Export as Asterisk dialplan and upload to your PBX</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
