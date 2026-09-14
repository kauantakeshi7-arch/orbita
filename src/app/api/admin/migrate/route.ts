import { NextRequest, NextResponse } from "next/server";
import { migrate } from "@/lib/store";

// Endpoint de uso único (ou repetível — é idempotente) para criar as
// tabelas no Postgres de produção sem precisar expor a DATABASE_URL.
// Protegido pelo próprio SESSION_SECRET (só quem tem acesso às env vars
// do projeto consegue chamar).
export async function POST(req: NextRequest) {
  const provided = req.headers.get("x-migrate-secret");
  const expected = process.env.SESSION_SECRET;
  if (!expected || !provided || provided !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    await migrate();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
