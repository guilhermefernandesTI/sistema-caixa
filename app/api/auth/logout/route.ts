import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth-store";

export async function POST() {
  const token = cookies().get("caixaflow_session")?.value;
  if (token) await destroySession(token);

  const response = NextResponse.json({ success: true });
  response.cookies.set("caixaflow_session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
