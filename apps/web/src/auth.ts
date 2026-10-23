import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@goldlens/db';

const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? 'goldlens-dev-secret-change-me',
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    ...(googleEnabled ? [Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET
    })] : []),
    Credentials({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? '').trim().toLowerCase();
        const password = String(credentials?.password ?? '');
        if (!email || !email.includes('@')) return null;
        if (password !== (process.env.DEMO_PASSWORD ?? 'goldlens')) return null;

        const db = await getDb();
        const existing = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
        let user = existing[0] ?? null;
        if (!user) {
          const role = email.startsWith('admin') ? 'admin' : email.startsWith('dealer') ? 'dealer' : 'user';
          const id = `u_${crypto.randomUUID()}`;
          const displayName = email.split('@')[0] ?? email;
          await db.insert(schema.users).values({ id, email, name: displayName, role, createdAt: new Date() });
          await db.insert(schema.profiles).values({ userId: id, market: 'TH', goal: 'buy', units: 'baht', locale: 'zh' }).onConflictDoNothing();
          await db.insert(schema.subscriptions).values({ id: `sub_${crypto.randomUUID()}`, userId: id, plan: 'free', status: 'active' }).onConflictDoNothing();
          user = { id, email, name: displayName, image: null, role, createdAt: new Date() };
        }
        if (!user) return null;
        return { id: user.id, email: user.email, name: user.name ?? '', role: user.role } as any;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role ?? 'user';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role ?? 'user';
      }
      return session;
    }
  }
});
