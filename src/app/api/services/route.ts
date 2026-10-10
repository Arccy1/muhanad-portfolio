import { NextResponse } from "next/server";
import { getServices, getSkills } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const [services, skills] = await Promise.all([getServices(), getSkills()]);
  return NextResponse.json({ services, skills });
}
