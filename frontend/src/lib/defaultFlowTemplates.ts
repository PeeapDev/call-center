import { Node, Edge, MarkerType } from 'reactflow';
import { Phone, MessageSquare, Users, Voicemail, PhoneOff, Clock } from 'lucide-react';

export const DEFAULT_FLOW_TEMPLATES = [
  {
    id: 'basic-support',
    name: 'Basic Support Flow',
    description: 'Simple IVR menu routing to departments',
    nodes: [
      {
        id: '1',
        type: 'input',
        data: { 
          label: 'Incoming Call',
          nodeType: 'start'
        },
        position: { x: 250, y: 50 },
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
      {
        id: '2',
        type: 'default',
        data: { 
          label: 'Welcome IVR',
          nodeType: 'ivr',
          message: 'Press 1 for Registration, 2 for Fees, 3 for General Inquiry'
        },
        position: { x: 250, y: 150 },
        style: {
          background: '#3b82f6',
          color: 'white',
          border: '2px solid rgba(0,0,0,0.1)',
          borderRadius: '8px',
          padding: '12px 16px',
          fontWeight: '500',
          minWidth: '150px',
        },
      },
      {
        id: '3',
        type: 'default',
        data: { 
          label: 'Registration Queue',
          nodeType: 'queue',
          queueName: 'registration'
        },
        position: { x: 50, y: 280 },
        style: {
          background: '#a855f7',
          color: 'white',
          border: '2px solid rgba(0,0,0,0.1)',
          borderRadius: '8px',
          padding: '12px 16px',
          fontWeight: '500',
          minWidth: '150px',
        },
      },
      {
        id: '4',
        type: 'default',
        data: { 
          label: 'Fees Queue',
          nodeType: 'queue',
          queueName: 'fees'
        },
        position: { x: 250, y: 280 },
        style: {
          background: '#a855f7',
          color: 'white',
          border: '2px solid rgba(0,0,0,0.1)',
          borderRadius: '8px',
          padding: '12px 16px',
          fontWeight: '500',
          minWidth: '150px',
        },
      },
      {
        id: '5',
        type: 'default',
        data: { 
          label: 'General Queue',
          nodeType: 'queue',
          queueName: 'general'
        },
        position: { x: 450, y: 280 },
        style: {
          background: '#a855f7',
          color: 'white',
          border: '2px solid rgba(0,0,0,0.1)',
          borderRadius: '8px',
          padding: '12px 16px',
          fontWeight: '500',
          minWidth: '150px',
        },
      },
    ],
    edges: [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      },
      {
        id: 'e2-3',
        source: '2',
        target: '3',
        label: 'Press 1',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      },
      {
        id: 'e2-4',
        source: '2',
        target: '4',
        label: 'Press 2',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      },
      {
        id: 'e2-5',
        source: '2',
        target: '5',
        label: 'Press 3',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      },
    ],
  },
  {
    id: 'office-hours',
    name: 'Office Hours Routing',
    description: 'Routes based on business hours',
    nodes: [
      {
        id: '1',
        type: 'input',
        data: { 
          label: 'Incoming Call',
          nodeType: 'start'
        },
        position: { x: 250, y: 50 },
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
      {
        id: '2',
        type: 'default',
        data: { 
          label: 'Check Time',
          nodeType: 'time',
          businessHours: '8:00-17:00'
        },
        position: { x: 250, y: 150 },
        style: {
          background: '#eab308',
          color: 'white',
          border: '2px solid rgba(0,0,0,0.1)',
          borderRadius: '8px',
          padding: '12px 16px',
          fontWeight: '500',
          minWidth: '150px',
        },
      },
      {
        id: '3',
        type: 'default',
        data: { 
          label: 'Welcome IVR',
          nodeType: 'ivr',
          message: 'Welcome! Press 1 for Support'
        },
        position: { x: 100, y: 280 },
        style: {
          background: '#3b82f6',
          color: 'white',
          border: '2px solid rgba(0,0,0,0.1)',
          borderRadius: '8px',
          padding: '12px 16px',
          fontWeight: '500',
          minWidth: '150px',
        },
      },
      {
        id: '4',
        type: 'default',
        data: { 
          label: 'After Hours Message',
          nodeType: 'voicemail',
          message: 'Office is closed. Leave a message.'
        },
        position: { x: 400, y: 280 },
        style: {
          background: '#6b7280',
          color: 'white',
          border: '2px solid rgba(0,0,0,0.1)',
          borderRadius: '8px',
          padding: '12px 16px',
          fontWeight: '500',
          minWidth: '150px',
        },
      },
      {
        id: '5',
        type: 'default',
        data: { 
          label: 'Support Queue',
          nodeType: 'queue',
          queueName: 'support'
        },
        position: { x: 100, y: 410 },
        style: {
          background: '#a855f7',
          color: 'white',
          border: '2px solid rgba(0,0,0,0.1)',
          borderRadius: '8px',
          padding: '12px 16px',
          fontWeight: '500',
          minWidth: '150px',
        },
      },
      {
        id: '6',
        type: 'output',
        data: { 
          label: 'Hang Up',
          nodeType: 'hangup'
        },
        position: { x: 400, y: 410 },
        style: {
          background: '#ef4444',
          color: 'white',
          border: '2px solid rgba(0,0,0,0.1)',
          borderRadius: '8px',
          padding: '12px 16px',
          fontWeight: '500',
          minWidth: '150px',
        },
      },
    ],
    edges: [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      },
      {
        id: 'e2-3',
        source: '2',
        target: '3',
        label: 'Office Hours',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#10b981', strokeWidth: 2 },
      },
      {
        id: 'e2-4',
        source: '2',
        target: '4',
        label: 'After Hours',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#ef4444', strokeWidth: 2 },
      },
      {
        id: 'e3-5',
        source: '3',
        target: '5',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      },
      {
        id: 'e4-6',
        source: '4',
        target: '6',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      },
    ],
  },
  {
    id: 'emergency',
    name: 'Emergency Routing',
    description: 'Priority routing for urgent calls',
    nodes: [
      {
        id: '1',
        type: 'input',
        data: { 
          label: 'Emergency Call',
          nodeType: 'start'
        },
        position: { x: 250, y: 50 },
        style: {
          background: '#ef4444',
          color: 'white',
          border: '2px solid #dc2626',
          borderRadius: '8px',
          padding: '12px 16px',
          fontWeight: 'bold',
          minWidth: '150px',
        },
      },
      {
        id: '2',
        type: 'default',
        data: { 
          label: 'Priority IVR',
          nodeType: 'ivr',
          message: 'Emergency line. Press 1 immediately for assistance'
        },
        position: { x: 250, y: 150 },
        style: {
          background: '#f97316',
          color: 'white',
          border: '2px solid rgba(0,0,0,0.1)',
          borderRadius: '8px',
          padding: '12px 16px',
          fontWeight: '500',
          minWidth: '150px',
        },
      },
      {
        id: '3',
        type: 'default',
        data: { 
          label: 'Emergency Queue',
          nodeType: 'queue',
          queueName: 'emergency',
          priority: 'high'
        },
        position: { x: 250, y: 280 },
        style: {
          background: '#dc2626',
          color: 'white',
          border: '2px solid rgba(0,0,0,0.1)',
          borderRadius: '8px',
          padding: '12px 16px',
          fontWeight: '500',
          minWidth: '150px',
        },
      },
    ],
    edges: [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#ef4444', strokeWidth: 3 },
      },
      {
        id: 'e2-3',
        source: '2',
        target: '3',
        label: 'Immediate',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#ef4444', strokeWidth: 3 },
      },
    ],
  },
];

export function loadDefaultTemplates() {
  const existing = localStorage.getItem('callFlows');
  if (!existing) {
    // Only load defaults if no flows exist
    localStorage.setItem('callFlows', JSON.stringify(DEFAULT_FLOW_TEMPLATES));
    return DEFAULT_FLOW_TEMPLATES;
  }
  return JSON.parse(existing);
}

export function initializeDefaultTemplates() {
  const flows = loadDefaultTemplates();
  console.log('📋 Loaded flow templates:', flows.length);
  return flows;
}
