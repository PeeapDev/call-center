'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Home, Phone, Users, FileAudio, Settings, LogOut, BarChart3, Edit, GitBranch, PhoneCall, Globe, Workflow, Briefcase, MessageSquare, User, Bell, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getNavigationItems, UserRole } from '@/lib/rbac';

function UserProfile() {
  const { data: session } = useSession();

  if (!session) return null;

  const user = session.user as any;
  const initials = user.name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="p-4 border-t border-gray-200">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
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
        onClick={() => signOut({ callbackUrl: '/landing' })}
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
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">
            Ministry of Education
          </h1>
          <p className="text-sm text-gray-500">Call Center</p>
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
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
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
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
