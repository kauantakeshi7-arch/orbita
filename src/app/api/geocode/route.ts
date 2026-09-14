import { NextRequest, NextResponse } from "next/server";
import { searchCities } from "@/lib/geocode";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const results = await searchCities(q);
  return NextResponse.json({ results });
}
