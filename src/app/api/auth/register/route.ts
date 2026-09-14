import { NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/lib/repo";
import { createSessionCookie, hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  const { email, password, displayName } = parsed.data;

  const existing = await findUserByEmail(email);
  if (existing) {
    return NextResponse.json(
      { error: "Já existe uma conta com esse e-mail." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser({ email, passwordHash, displayName });
  await createSessionCookie(user.id);

  return NextResponse.json({
    user: { id: user.id, email: user.email, displayName: user.displayName },
  });
}
