import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { RoleName } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const displayName = String(body.displayName ?? "").trim();

    if (!email || !password || !displayName) {
      return NextResponse.json(
        { error: "email, password, displayName are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const role = await prisma.role.upsert({
      where: { name: RoleName.USER },
      create: { name: RoleName.USER },
      update: {},
      select: { id: true },
    });

    const user = await prisma.user.create({
      data: {
        email,
        displayName,
        passwordHash,
        roles: { create: [{ roleId: role.id }] },
      },
      select: { id: true, email: true, displayName: true, createdAt: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
