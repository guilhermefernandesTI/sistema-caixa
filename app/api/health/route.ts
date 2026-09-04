import { NextResponse } from "next/server";
export function GET() { return NextResponse.json({ status: "ok", database: Boolean(process.env.DATABASE_URL), app: "caixa-flow" }); }
