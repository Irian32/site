import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

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

        // IMPORTANT: Prisma instancié ici (pas au top-level) pour éviter de casser le build si DATABASE_URL manque
        const prisma = new PrismaClient();

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return { id: user.id, email: user.email, name: user.displayName };
      },
    }),
  ],
});

export { authHandler as GET, authHandler as POST };