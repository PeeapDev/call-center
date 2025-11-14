import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

// Mock user database - in production, this would come from your backend
const users = [
  {
    id: '1',
    email: 'admin@education.gov',
    password: 'admin123', // In production: hashed with bcrypt
    name: 'Admin User',
    role: 'admin',
  },
  {
    id: '2',
    email: 'supervisor@education.gov',
    password: 'super123',
    name: 'Sarah Johnson',
    role: 'supervisor',
  },
  {
    id: '3',
    email: 'agent@education.gov',
    password: 'agent123',
    name: 'Michael Chen',
    role: 'agent',
  },
  {
    id: '4',
    email: 'analyst@education.gov',
    password: 'analyst123',
    name: 'Emily Rodriguez',
    role: 'analyst',
  },
  {
    id: '5',
    email: 'auditor@education.gov',
    password: 'auditor123',
    name: 'David Kim',
    role: 'auditor',
  },
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = users.find(
          (u) =>
            u.email === credentials?.email &&
            u.password === credentials?.password
        );

        if (!user) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
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
