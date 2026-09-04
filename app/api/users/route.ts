import { NextResponse } from "next/server";
import { createUser, listUsers } from "@/lib/auth-store";

export async function GET() {
  return NextResponse.json({ users: listUsers() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const user = await createUser({
      username: body.username,
      displayName: body.displayName,
      password: body.password,
      role: body.role === "admin" ? "admin" : "client",
      theme: body.theme,
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível criar o usuário." }, { status: 400 });
  }
}
