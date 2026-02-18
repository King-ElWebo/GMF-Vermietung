import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/server/prisma";
import {
  getAllItems,
  createItem,
  createItemSchema,
} from "@/src/lib/services/item";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const activeParam = searchParams.get("active");
    const search = searchParams.get("search") || undefined;

    const active =
      activeParam === "true" ? true : activeParam === "false" ? false : undefined;

    const items = await getAllItems({ categoryId, active, search });

    return NextResponse.json({ ok: true, data: items });
  } catch (error) {
    console.error("[GET /api/items]", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Validation failed",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const item = await createItem(parsed.data);

    return NextResponse.json({ ok: true, data: item }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/items]", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { ok: false, error: "Slug bereits vergeben" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { ok: false, error: "Failed to create item" },
      { status: 500 }
    );
  }
}
