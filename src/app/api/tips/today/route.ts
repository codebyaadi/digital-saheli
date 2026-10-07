import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { pickTipOfDay } from "@/lib/tip-of-day";

/** One safety tip per day. Deterministic, so the home page and this endpoint always agree. */
export async function GET() {
  const tips = await prisma.safetyTip.findMany({ select: { id: true, text: true, textHi: true } });
  const tip = pickTipOfDay(tips);
  return NextResponse.json({ date: new Date().toISOString().slice(0, 10), tip });
}