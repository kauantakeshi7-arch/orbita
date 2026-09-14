import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/repo";
import { createSessionCookie, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;
  const user = await findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json(
      { error: "E-mail ou senha incorretos." },
      { status: 401 }
    );
  }

  await createSessionCookie(user.id);
  return NextResponse.json({
    user: { id: user.id, email: user.email, displayName: user.displayName },
  });
}
