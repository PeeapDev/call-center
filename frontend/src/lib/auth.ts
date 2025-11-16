import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { API_ENDPOINTS } from './config';

// Account type to role mapping
const accountTypeToRole = (accountType: string): string => {
  const mapping: Record<string, string> = {
    admin: 'admin',
    supervisor: 'supervisor',
    agent: 'agent',
    analyst: 'analyst',
    auditor: 'auditor',
    citizen: 'citizen',
  };
  return mapping[accountType] || 'citizen';
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        phoneNumber: { label: 'Phone Number', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Call backend API to authenticate
          const response = await fetch(`${API_ENDPOINTS.hrUsers}`);
          const data = await response.json();

          if (data.status !== 'ok') {
            throw new Error('Failed to fetch users');
          }

          // Find user by phone number
          const user = data.users.find(
            (u: any) => u.phoneNumber === credentials?.phoneNumber
          );

          if (!user) {
            throw new Error('User not found');
          }

          // Verify password (backend stores hashed password)
          // We need to call a backend login endpoint that verifies the password
          const loginResponse = await fetch(`${API_ENDPOINTS.hrUsers}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phoneNumber: credentials?.phoneNumber,
              password: credentials?.password,
            }),
          });

          const loginData = await loginResponse.json();

          if (loginData.status !== 'ok') {
            throw new Error('Invalid phone number or password');
          }

          // Store phone in localStorage for later use
          if (typeof window !== 'undefined') {
            localStorage.setItem('userPhone', user.phoneNumber);
          }

          return {
            id: user.id,
            phone: user.phoneNumber,
            name: user.name,
            role: accountTypeToRole(user.accountType),
            accountType: user.accountType,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          throw new Error('Invalid phone number or password');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
