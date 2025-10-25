// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { hardcodedUserData } from '@/lib/userData';

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (credentials?.username === 'rkumar' && credentials?.password === 'password') {
          return {
            id: '1',
            name: 'rkumar',
            email: 'rkumar@example.com',
            // userData will be added in jwt callback
          };
        }
        return null;
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    // ✅ signIn: only return true/false
    async signIn({ account, profile }) {
      if (account?.provider === 'google') {
        if (!profile || !profile.email) {
          console.error('Google profile missing or no email');
          return false;
        }
        // Optional: restrict to certain domains
        // if (!profile.email.endsWith('@yourcompany.com')) return false;
        return true; // ✅ Allow sign-in
      }
      return true;
    },

    // ✅ jwt: this is where you attach custom data
    async jwt({ token, user, account, profile }) {
      // Case 1: Initial sign-in (user comes from authorize() or OAuth profile)
      if (user) {
        token.id = user.id;
        // Attach hardcoded data on first JWT creation
        token.userData = hardcodedUserData;
      }

      // Case 2: Google OAuth (user is not passed, but profile is available on first call)
      // Note: profile is only available on initial sign-in, not on subsequent calls
      if (account?.provider === 'google' && profile && !token.userData) {
        token.id = profile.sub || profile.email || 'google-user';
        token.userData = hardcodedUserData;
      }

      return token;
    },

    // ✅ session: expose token data to frontend
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.userData = token.userData; // ✅ Now available in useSession()
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };