import { NextResponse } from "next/server";
import { deleteUserById, getUserById, updateUserProfile } from "@/lib/auth-store";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const user = getUserById(params.id);
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json().catch(() => ({}));
    const updated = updateUserProfile(params.id, body);

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
    const deleted = deleteUserById(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ user: deleted, message: "Estabelecimento removido com sucesso." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível excluir o usuário." }, { status: 400 });
  }
}
