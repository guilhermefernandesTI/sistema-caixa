import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionUser, updateUserTheme } from "@/lib/auth-store";

export async function PUT(request: Request) {
  const token = cookies().get("caixaflow_session")?.value;
  const user = token ? await getSessionUser(token) : null;

  if (!user) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  }

  if (user.role !== "admin") {
    return NextResponse.json({ error: "A personalização do estabelecimento só pode ser alterada pelo administrador." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const updated = await updateUserTheme(user.id!, body);
  if (!updated) {
    return NextResponse.json({ error: "Não foi possível atualizar a personalização." }, { status: 400 });
  }

  return NextResponse.json({ user: updated });
}
