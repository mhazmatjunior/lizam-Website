import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Extracted from the NextAuth route so server-side API routes can call
// getServerSession(authOptions) and check for an admin session themselves.
// The middleware only guards /admin/* pages, not /api/*.
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

        if (!adminEmail || !adminPasswordHash) return null;

        if (credentials.email !== adminEmail) {
          return null;
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          adminPasswordHash
        );

        if (!isPasswordCorrect) {
          return null;
        }

        return {
          id: "1",
          name: "Admin",
          email: adminEmail,
        };
      }
    })
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    }
  }
};

/** True when the caller has a valid admin session. */
export async function isAdminRequest() {
  const { getServerSession } = await import("next-auth");
  const session = await getServerSession(authOptions);
  return Boolean(session?.user?.email);
}
