import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getBirthProfile } from "@/lib/repo";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null, hasProfile: false });
  }
  const profile = await getBirthProfile(user.id);
  return NextResponse.json({
    user: { id: user.id, email: user.email, displayName: user.displayName },
    hasProfile: Boolean(profile),
  });
}
