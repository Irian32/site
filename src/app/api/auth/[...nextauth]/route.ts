import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma"; // <-- singleton
// (si tu veux garder PrismaClient inline, ok, mais voilà la version propre)

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const authHandler = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password ?? "";
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return { id: user.id, email: user.email, name: user.displayName };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // user existe seulement au moment du signIn
      if (user) {
        token.sub = user.id; // standard
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      // Ajoute l'id à la session côté client
      if (session.user) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
});

export { authHandler as GET, authHandler as POST };
