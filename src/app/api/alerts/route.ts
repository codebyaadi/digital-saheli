import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/** Public read-only feed of active alerts, for the home page widget and the demo API. */
export async function GET() {
  const alerts = await prisma.alert.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, title: true, titleHi: true, body: true, severity: true, createdAt: true },
  });
  return NextResponse.json({ count: alerts.length, alerts });
}