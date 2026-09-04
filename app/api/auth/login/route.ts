import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSession, validatePassword } from "@/lib/auth-store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const username = String(body.username || "").trim();
  const password = String(body.password || "");

  if (!username || !password) {
    return NextResponse.json({ error: "Usuário e senha são obrigatórios." }, { status: 400 });
  }

  const user = validatePassword(username, password);
  if (!user) {
    return NextResponse.json({ error: "Usuário ou senha inválidos." }, { status: 401 });
  }

  const token = crypto.randomUUID();
  createSession(token, user.id!);

  cookies().set("caixaflow_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({
    user,
    message: "Login realizado com sucesso.",
  });
}
