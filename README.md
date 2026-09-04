# caixa flow

MVP de frente de caixa (PDV) para pequenos negócios, construído com Next.js App Router, TypeScript, Tailwind CSS e Prisma/PostgreSQL. A interface é responsiva e já inclui dashboard, catálogo, carrinho de vendas e abertura/fechamento de caixa.

## Rodando localmente

Requisitos: Node.js 18.17+ e npm.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). O MVP funciona sem banco usando dados locais de demonstração. Para conectar o PostgreSQL, preencha `DATABASE_URL` em `.env.local` e execute:

```bash
npx prisma generate
npm run db:push
```

Use `npm run db:studio` para inspecionar os dados. O endpoint `/api/health` indica se a variável de banco está configurada.

## Deploy na Vercel

1. Suba este repositório para o GitHub e importe-o na Vercel.
2. Em **Settings → Environment Variables**, adicione `DATABASE_URL` com a URL do seu PostgreSQL (Neon, Supabase, Railway ou outro provedor).
3. O build configurado é `prisma generate && next build`; a geração do client acontece automaticamente.
4. Depois do primeiro deploy, rode `npx prisma db push` apontando para o banco de produção (ou configure uma etapa de migração no pipeline).

> Limitação do MVP: as ações de criar produto, registrar venda e abrir/fechar caixa atualmente demonstram o fluxo na interface e usam fallback local. O schema Prisma está pronto para persistência; a camada de mutations/API deve ser conectada ao `lib/prisma.ts` antes de operar em produção com múltiplos usuários.

## Estrutura

- `app/` — rotas do App Router e API de health check
- `components/` — shell de navegação e componentes visuais
- `lib/data.ts` — dados mock para demonstração sem credenciais
- `lib/prisma.ts` — singleton do Prisma Client
- `prisma/schema.prisma` — modelos de produtos, vendas, itens e sessões de caixa
