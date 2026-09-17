import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-store";
import { products } from "@/lib/data";

async function currentOwner() {
  const token = cookies().get("caixaflow_session")?.value;
  if (!token) return null;
  const sessionUser = await getSessionUser(token);
  if (!sessionUser?.id) return null;
  return prisma.user.findUnique({ where: { id: sessionUser.id }, select: { id: true, tenantId: true, displayName: true } });
}

const number = (value: unknown) => typeof value === "number" ? value : Number(value);

async function ensureProducts(tenantId: string, ownerId: string) {
  const count = await prisma.product.count({ where: { tenantId } });
  if (count > 0) return;
  await prisma.product.createMany({ data: products.map((product) => ({ tenantId, ownerId, sku: `${tenantId}-${product.sku}`, name: product.name, category: product.category, price: product.price, stock: product.stock })) });
}

export async function GET() {
  const owner = await currentOwner();
  if (!owner) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const [open, history, sales] = await Promise.all([
    prisma.cashSession.findFirst({ where: { tenantId: owner.tenantId, status: "OPEN" }, orderBy: { openedAt: "desc" } }),
    prisma.cashSession.findMany({ where: { tenantId: owner.tenantId, status: "CLOSED" }, orderBy: { closedAt: "desc" }, take: 20 }),
    prisma.sale.findMany({ where: { tenantId: owner.tenantId }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);

  return NextResponse.json({ open, history, sales });
}

export async function POST(request: Request) {
  const owner = await currentOwner();
  if (!owner) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const body = await request.json();
  if (body.action === "open") {
    const openingAmount = number(body.openingAmount);
    if (!Number.isFinite(openingAmount) || openingAmount < 0) return NextResponse.json({ error: "Valor de abertura inválido." }, { status: 400 });
    const alreadyOpen = await prisma.cashSession.findFirst({ where: { tenantId: owner.tenantId, status: "OPEN" } });
    if (alreadyOpen) return NextResponse.json({ error: "Já existe um caixa aberto." }, { status: 409 });
    const session = await prisma.cashSession.create({ data: { tenantId: owner.tenantId, userId: owner.id, openingAmount } });
    return NextResponse.json({ session });
  }

  if (body.action === "close") {
    const closingAmount = number(body.closingAmount);
    if (!Number.isFinite(closingAmount) || closingAmount < 0) return NextResponse.json({ error: "Valor contado inválido." }, { status: 400 });
    const open = await prisma.cashSession.findFirst({ where: { tenantId: owner.tenantId, status: "OPEN" } });
    if (!open) return NextResponse.json({ error: "Não há caixa aberto." }, { status: 404 });
    const session = await prisma.cashSession.update({ where: { id: open.id }, data: { status: "CLOSED", closingAmount, closedAt: new Date() } });
    return NextResponse.json({ session });
  }

  if (body.action === "sale") {
    const paymentMethod = String(body.paymentMethod ?? "");
    const items = Array.isArray(body.items) ? body.items : [];
    if (!['Pix', 'Cartão', 'Dinheiro'].includes(paymentMethod) || items.length === 0) return NextResponse.json({ error: "Venda inválida." }, { status: 400 });
    await ensureProducts(owner.tenantId, owner.id);
    const open = await prisma.cashSession.findFirst({ where: { tenantId: owner.tenantId, status: "OPEN" } });
    if (!open) return NextResponse.json({ error: "Abra o caixa antes de vender." }, { status: 409 });

    try {
      const sale = await prisma.$transaction(async (tx) => {
        let total = 0;
        const saleItems: { productId: string; quantity: number; unitPrice: number }[] = [];
        for (const item of items) {
          const productId = String(item.productId ?? "");
          const quantity = Math.floor(number(item.quantity));
          if (!productId || !Number.isFinite(quantity) || quantity < 1) throw new Error("Item inválido.");
          const catalogProduct = products.find((product) => product.id === productId);
          const product = catalogProduct
            ? await tx.product.findFirst({ where: { tenantId: owner.tenantId, sku: `${owner.tenantId}-${catalogProduct.sku}` } })
            : await tx.product.findFirst({ where: { id: productId, tenantId: owner.tenantId } });
          if (!product || product.stock < quantity) throw new Error(`Estoque insuficiente para ${product?.name ?? "o produto"}.`);
          const unitPrice = Number(product.price);
          total += unitPrice * quantity;
          saleItems.push({ productId, quantity, unitPrice });
          await tx.product.update({ where: { id: product.id }, data: { stock: { decrement: quantity } } });
        }
        return tx.sale.create({ data: { tenantId: owner.tenantId, userId: owner.id, cashSessionId: open.id, total, paymentMethod, items: { create: saleItems.map((item) => ({ tenantId: owner.tenantId, ...item })) } }, include: { items: true } });
      });
      return NextResponse.json({ sale });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível concluir a venda." }, { status: 400 });
    }
  }

  return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
}
