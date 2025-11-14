// Role-Based Access Control Helper

export type UserRole = 'admin' | 'supervisor' | 'agent' | 'analyst' | 'auditor';

export interface RolePermissions {
  canViewDashboard: boolean;
  canViewMyCalls: boolean;
  canViewRouting: boolean;
  canEditRouting: boolean;
  canViewCallFlowBuilder: boolean;
  canViewAllCalls: boolean;
  canViewAgents: boolean;
  canManageAgents: boolean;
  canViewRecordings: boolean;
  canDownloadRecordings: boolean;
  canViewAnalytics: boolean;
  canViewContent: boolean;
  canEditContent: boolean;
  canViewSettings: boolean;
  canEditSettings: boolean;
  canViewWebRTC: boolean;
}

export const rolePermissions: Record<UserRole, RolePermissions> = {
  admin: {
    canViewDashboard: true,
    canViewMyCalls: true,
    canViewRouting: true,
    canEditRouting: true,
    canViewCallFlowBuilder: true,
    canViewAllCalls: true,
    canViewAgents: true,
    canManageAgents: true,
    canViewRecordings: true,
    canDownloadRecordings: true,
    canViewAnalytics: true,
    canViewContent: true,
    canEditContent: true,
    canViewSettings: true,
    canEditSettings: true,
    canViewWebRTC: true,
  },
  supervisor: {
    canViewDashboard: true,
    canViewMyCalls: true,
    canViewRouting: true,
    canEditRouting: false,
    canViewCallFlowBuilder: true,
    canViewAllCalls: true,
    canViewAgents: true,
    canManageAgents: false,
    canViewRecordings: true,
    canDownloadRecordings: true,
    canViewAnalytics: true,
    canViewContent: false,
    canEditContent: false,
    canViewSettings: false,
    canEditSettings: false,
    canViewWebRTC: true,
  },
  agent: {
    canViewDashboard: false, // Agents get their own simplified dashboard
    canViewMyCalls: true,
    canViewRouting: false,
    canEditRouting: false,
    canViewCallFlowBuilder: false,
    canViewAllCalls: false,
    canViewAgents: false,
    canManageAgents: false,
    canViewRecordings: false,
    canDownloadRecordings: false,
    canViewAnalytics: false,
    canViewContent: false,
    canEditContent: false,
    canViewSettings: false,
    canEditSettings: false,
    canViewWebRTC: true,
  },
  analyst: {
    canViewDashboard: true,
    canViewMyCalls: false,
    canViewRouting: false,
    canEditRouting: false,
    canViewCallFlowBuilder: false,
    canViewAllCalls: false,
    canViewAgents: false,
    canManageAgents: false,
    canViewRecordings: false,
    canDownloadRecordings: false,
    canViewAnalytics: true,
    canViewContent: false,
    canEditContent: false,
    canViewSettings: false,
    canEditSettings: false,
    canViewWebRTC: false,
  },
  auditor: {
    canViewDashboard: true,
    canViewMyCalls: false,
    canViewRouting: false,
    canEditRouting: false,
    canViewCallFlowBuilder: false,
    canViewAllCalls: true,
    canViewAgents: false,
    canManageAgents: false,
    canViewRecordings: true,
    canDownloadRecordings: false,
    canViewAnalytics: false,
    canViewContent: false,
    canEditContent: false,
    canViewSettings: false,
    canEditSettings: false,
    canViewWebRTC: false,
  },
};

export function hasPermission(role: UserRole | undefined, permission: keyof RolePermissions): boolean {
  if (!role) return false;
  return rolePermissions[role]?.[permission] ?? false;
}

export function getNavigationItems(role: UserRole | undefined) {
  if (!role) return [];

  const permissions = rolePermissions[role];

  const items: Array<{ href: string; label: string; icon: string }> = [];

  if (role === 'agent' as UserRole) {
    // Agents see simplified navigation
    items.push(
      { href: '/dashboard/my-calls', label: 'My Calls', icon: 'PhoneCall' },
      { href: '/dashboard/webrtc-setup', label: 'Phone Setup', icon: 'Settings' },
    );
  } else {
    // Admin/Supervisor/Analyst/Auditor navigation
    if (permissions.canViewDashboard) {
      items.push({ href: '/dashboard', label: 'Dashboard', icon: 'Home' });
    }

    if (permissions.canViewMyCalls) {
      items.push({ href: '/dashboard/my-calls', label: 'My Calls', icon: 'PhoneCall' });
    }

    if (permissions.canViewRouting) {
      items.push({ href: '/dashboard/routing', label: 'Call Routing', icon: 'GitBranch' });
    }

    if (permissions.canViewCallFlowBuilder) {
      items.push({ href: '/dashboard/call-flow-builder', label: 'Flow Builder', icon: 'Workflow' });
    }

    if (permissions.canViewAllCalls) {
      items.push({ href: '/dashboard/calls', label: 'Active Calls', icon: 'Phone' });
    }

    if (permissions.canViewAgents) {
      items.push({ href: '/dashboard/agents', label: 'Agents', icon: 'Users' });
    }

    if (permissions.canViewRecordings) {
      items.push({ href: '/dashboard/recordings', label: 'Recordings', icon: 'FileAudio' });
    }

    if (permissions.canViewAnalytics) {
      items.push({ href: '/dashboard/analytics', label: 'AI Analytics', icon: 'BarChart3' });
    }

    if (permissions.canViewContent) {
      items.push({ href: '/dashboard/content', label: 'Content Management', icon: 'Edit' });
    }

    if (permissions.canViewSettings) {
      items.push({ href: '/dashboard/settings', label: 'Settings', icon: 'Settings' });
    }

    if (permissions.canViewWebRTC && role !== 'agent') {
      items.push({ href: '/dashboard/webrtc-setup', label: 'WebRTC Setup', icon: 'Globe' });
    }
  }

  return items;
}
