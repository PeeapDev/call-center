'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Home, Phone, Users, FileAudio, Settings, LogOut, BarChart3, Edit, GitBranch, PhoneCall, Globe, Workflow, Briefcase, MessageSquare, User, Bell, FileText, Sun, Moon, GraduationCap, UserCog, Brain } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getNavigationItems, UserRole } from '@/lib/rbac';
import NotificationBell from '@/components/NotificationBell';
import { useTheme } from '@/components/providers';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast';

function UserProfile() {
  const { data: session } = useSession();
  const { confirm } = useConfirm();
  const { showToast } = useToast();

  if (!session) return null;

  const user = session.user as any;
  const initials = user.name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || 'U';

  const handleSignOut = async () => {
    const confirmed = await confirm({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out? Any unsaved changes will be lost.',
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
      type: 'warning',
    });

    if (confirmed) {
      showToast('Signing out...', 'info');
      signOut({ callbackUrl: '/landing' });
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {user.name}
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {user.role}
            </Badge>
          </div>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handleSignOut}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const user = session?.user as any;
  const userRole = user?.role as UserRole;

  // Get navigation items based on user role
  const navItems = getNavigationItems(userRole);

  // Icon mapping
  const iconMap: Record<string, any> = {
    Home,
    Phone,
    PhoneCall,
    GitBranch,
    Workflow,
    Users,
    FileAudio,
    BarChart3,
    Edit,
    Settings,
    Globe,
    Briefcase,
    MessageSquare,
    User,
    Bell,
    FileText,
    GraduationCap,
    UserCog,
    Brain,
  };

  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Ministry of Education
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Call Center</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon] || Home;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <UserProfile />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header Bar with Notifications */}
        {(userRole === 'admin' || userRole === 'agent' || userRole === 'supervisor') && (
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {pathname === '/dashboard' && 'Dashboard'}
                {pathname === '/dashboard/chat' && 'Live Chat'}
                {pathname === '/dashboard/calls' && 'Active Calls'}
                {pathname === '/dashboard/hr' && 'HR Management'}
                {pathname === '/dashboard/analytics' && 'Analytics'}
                {pathname === '/dashboard/settings' && 'Settings'}
                {!pathname.match(/\/(dashboard|chat|calls|hr|analytics|settings)$/) && 'Call Center'}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <NotificationBell />
            </div>
          </div>
        )}

        <main className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
