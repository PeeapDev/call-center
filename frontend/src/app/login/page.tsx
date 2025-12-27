'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
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
        phoneNumber,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid phone number or password');
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

  const quickLogin = (phone: string, pwd: string) => {
    setPhoneNumber(phone);
    setPassword(pwd);
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
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="+232 76 123 456"
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

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <a href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                    Register as Citizen
                  </a>
                </p>
              </div>
            </form>

            {/* Quick Login Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center mb-3">Quick Login (Demo Accounts)</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('000-000-0001', 'Admin@123')}
                  className="text-xs bg-red-50 border-red-200 hover:bg-red-100"
                >
                  <Badge className="mr-1 bg-red-500 text-[10px]">Admin</Badge>
                  Super Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('000-000-0002', 'Test@123')}
                  className="text-xs bg-purple-50 border-purple-200 hover:bg-purple-100"
                >
                  <Badge className="mr-1 bg-purple-500 text-[10px]">Sup</Badge>
                  Supervisor
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('000-000-0003', 'Test@123')}
                  className="text-xs bg-blue-50 border-blue-200 hover:bg-blue-100"
                >
                  <Badge className="mr-1 bg-blue-500 text-[10px]">Agent</Badge>
                  Alex Agent
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('000-000-0004', 'Test@123')}
                  className="text-xs bg-green-50 border-green-200 hover:bg-green-100"
                >
                  <Badge className="mr-1 bg-green-500 text-[10px]">Analyst</Badge>
                  Dana Analyst
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('000-000-0005', 'Test@123')}
                  className="text-xs bg-gray-50 border-gray-200 hover:bg-gray-100 col-span-2"
                >
                  <Badge className="mr-1 bg-gray-500 text-[10px]">Citizen</Badge>
                  John Citizen
                </Button>
              </div>
            </div>

            <div className="mt-4 text-center text-sm text-gray-500">
              <p>Protected by Ministry of Education IT Security</p>
            </div>
          </CardContent>
        </Card>

        {/* Login Information */}
        <Card className="shadow-xl bg-gradient-to-br from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle>How to Login</CardTitle>
            <p className="text-sm text-gray-600">
              Use your registered phone number and password
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <p className="font-semibold text-gray-900 mb-2">📱 For Staff Members:</p>
              <p className="text-sm text-gray-700">
                Your account has been created by HR. Use the phone number provided during registration and the password you set up.
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">
                🔐 Role-Based Access:
              </p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>
                  <strong>Admin:</strong> Full system access + settings
                </li>
                <li>
                  <strong>Supervisor:</strong> Monitor agents & view reports
                </li>
                <li>
                  <strong>Agent:</strong> Handle calls & view own stats
                </li>
                <li>
                  <strong>Analyst:</strong> View analytics and reports
                </li>
                <li>
                  <strong>Auditor:</strong> Access recordings (read-only)
                </li>
                <li>
                  <strong>Citizen:</strong> View own calls and cases
                </li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-900 mb-2">
                👤 New Citizens:
              </p>
              <p className="text-sm text-green-800 mb-2">
                Don't have an account yet? Register now to:
              </p>
              <ul className="text-xs text-green-800 space-y-1 ml-4 list-disc">
                <li>Track your complaints and cases</li>
                <li>Call the Ministry hotline (117)</li>
                <li>View call history and status</li>
                <li>Receive notifications</li>
              </ul>
              <a 
                href="/register" 
                className="mt-3 inline-block text-sm font-semibold text-green-700 hover:text-green-900"
              >
                → Click here to register
              </a>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                <strong>🔒 Security Notice:</strong> Never share your password. Ministry staff will never ask for your password via phone or email.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
