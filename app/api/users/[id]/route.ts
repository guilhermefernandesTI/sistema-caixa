import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { deleteUserById, getSessionUser, getUserById, updateUserProfile } from "@/lib/auth-store";

async function getCurrentAdmin() {
  const token = cookies().get("caixaflow_session")?.value;
  const user = token ? await getSessionUser(token) : null;
  if (!user || user.role !== "admin") {
    return null;
  }
  return user;
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const user = await getUserById(params.id);
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!(await getCurrentAdmin())) {
      return NextResponse.json({ error: "Apenas o administrador pode alterar cadastros e personalização." }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const updated = await updateUserProfile(params.id, body);

    if (!updated) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ user: updated });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível atualizar o usuário." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    if (!(await getCurrentAdmin())) {
      return NextResponse.json({ error: "Apenas o administrador pode excluir estabelecimentos." }, { status: 403 });
    }

    const deleted = await deleteUserById(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ user: deleted, message: "Estabelecimento removido com sucesso." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível excluir o usuário." }, { status: 400 });
  }
}
