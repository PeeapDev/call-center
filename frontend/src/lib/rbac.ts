// Role-Based Access Control Helper

export type UserRole = 'admin' | 'supervisor' | 'agent' | 'analyst' | 'auditor' | 'citizen';

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
  canViewHR: boolean;
  canManageHR: boolean;
  canViewAIConfig: boolean;
  canViewChat: boolean;
  canViewCitizenChat: boolean;
  canViewProfile: boolean;
  canViewNotice: boolean;
  canViewBlog: boolean;
  canViewCallDialer: boolean;
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
    canViewHR: true,
    canManageHR: true,
    canViewAIConfig: true,
    canViewChat: true,
    canViewCitizenChat: false,
    canViewProfile: false,
    canViewNotice: false,
    canViewBlog: false,
    canViewCallDialer: false,
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
    canViewHR: true,
    canManageHR: false,
    canViewAIConfig: true,
    canViewChat: true,
    canViewCitizenChat: false,
    canViewProfile: false,
    canViewNotice: false,
    canViewBlog: false,
    canViewCallDialer: false,
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
    canViewHR: false,
    canManageHR: false,
    canViewAIConfig: false,
    canViewChat: true,
    canViewCitizenChat: false,
    canViewProfile: false,
    canViewNotice: false,
    canViewBlog: false,
    canViewCallDialer: false,
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
    canViewHR: false,
    canManageHR: false,
    canViewAIConfig: false,
    canViewChat: false,
    canViewCitizenChat: false,
    canViewProfile: false,
    canViewNotice: false,
    canViewBlog: false,
    canViewCallDialer: false,
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
    canViewHR: false,
    canManageHR: false,
    canViewAIConfig: false,
    canViewChat: false,
    canViewCitizenChat: false,
    canViewProfile: false,
    canViewNotice: false,
    canViewBlog: false,
    canViewCallDialer: false,
  },
  citizen: {
    canViewDashboard: false, // Citizens get their own user dashboard
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
    canViewWebRTC: false,
    canViewHR: false,
    canManageHR: false,
    canViewAIConfig: false,
    canViewChat: false,
    canViewCitizenChat: true,
    canViewProfile: true,
    canViewNotice: true,
    canViewBlog: true,
    canViewCallDialer: true,
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
  } else if (role === 'citizen' as UserRole) {
    // Citizens see their own simple navigation
    items.push(
      { href: '/dashboard/user', label: 'My Portal', icon: 'Home' },
      { href: '/dashboard/my-calls', label: 'My Calls', icon: 'PhoneCall' },
      { href: '/dashboard/citizen-chat', label: 'Chat', icon: 'MessageSquare' },
      { href: '/dashboard/profile', label: 'Profile', icon: 'User' },
      { href: '/dashboard/notice', label: 'Notice', icon: 'Bell' },
      { href: '/dashboard/blog', label: 'Blog', icon: 'FileText' },
      { href: '/dashboard/call-dialer', label: 'Call Dialer', icon: 'Phone' },
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

    if (permissions.canViewHR) {
      items.push({ href: '/dashboard/hr', label: 'Human Resources', icon: 'Briefcase' });
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

    if (permissions.canViewAIConfig) {
      items.push({ href: '/dashboard/ai-config', label: 'AI Config', icon: 'Brain' });
    }

    if (permissions.canViewChat) {
      items.push({ href: '/dashboard/chat', label: 'Chat Support', icon: 'MessageSquare' });
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
