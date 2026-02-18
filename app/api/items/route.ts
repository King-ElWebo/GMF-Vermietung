import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/server/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await prisma.item.findMany({
      where: { active: true },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          orderBy: { sortOrder: "asc" },
          select: { id: true, url: true, sortOrder: true },
        },
      },
    });

    return NextResponse.json({ ok: true, data: items });
  } catch (error) {
    console.error("[GET /api/items]", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}
