'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { role: 'Admin', email: 'admin@education.gov', password: 'admin123' },
    { role: 'Supervisor', email: 'supervisor@education.gov', password: 'super123' },
    { role: 'Agent', email: 'agent@education.gov', password: 'agent123' },
    { role: 'Analyst', email: 'analyst@education.gov', password: 'analyst123' },
    { role: 'Auditor', email: 'auditor@education.gov', password: 'auditor123' },
    { role: 'Citizen', email: 'citizen@example.com', password: 'citizen123' },
  ];

  const quickLogin = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8">
        {/* Login Form */}
        <Card className="shadow-xl">
          <CardHeader className="space-y-1 text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold">Ministry of Education</CardTitle>
            <p className="text-gray-500">Call Center Portal</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="your.email@education.gov"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full py-3 text-base"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Protected by Ministry of Education IT Security</p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card className="shadow-xl bg-gradient-to-br from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle>Demo Accounts</CardTitle>
            <p className="text-sm text-gray-600">
              Click any account below to quick-fill the login form
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                onClick={() => quickLogin(account.email, account.password)}
                className="w-full p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{account.role}</p>
                    <p className="text-sm text-gray-600 mt-1">{account.email}</p>
                  </div>
                  <Badge variant="outline">{account.role}</Badge>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Password: {account.password}
                </div>
              </button>
            ))}

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">
                🔐 Role Permissions:
              </p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>
                  <strong>Admin:</strong> Full system access
                </li>
                <li>
                  <strong>Supervisor:</strong> Monitor agents, view reports
                </li>
                <li>
                  <strong>Agent:</strong> Handle calls, view own stats
                </li>
                <li>
                  <strong>Analyst:</strong> View analytics and reports
                </li>
                <li>
                  <strong>Auditor:</strong> Read-only access to recordings
                </li>
                <li>
                  <strong>Citizen:</strong> View own calls and cases
                </li>
              </ul>
            </div>

            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-900 mb-2">
                👤 Citizen / User Login:
              </p>
              <p className="text-xs text-green-800">
                This portal is primarily for staff today. Citizens normally contact the Ministry
                using the <span className="font-semibold">117</span> hotline or the mobile app.
                As we roll out the new authentication system, citizens will be able to log in
                with their phone number and password to see their own calls and cases.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
