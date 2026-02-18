import { NextRequest, NextResponse } from "next/server";
import {
  getItemById,
  updateItem,
  deleteItem,
  updateItemSchema,
} from "@/src/lib/services/item";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await getItemById(params.id);

    if (!item) {
      return NextResponse.json(
        { ok: false, error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: item });
  } catch (error) {
    console.error("[GET /api/items/[id]]", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch item" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const parsed = updateItemSchema.safeParse(body);

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

    const item = await updateItem(params.id, parsed.data);

    return NextResponse.json({ ok: true, data: item });
  } catch (error: any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { ok: false, error: "Item not found" },
        { status: 404 }
      );
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        { ok: false, error: "Slug bereits vergeben" },
        { status: 409 }
      );
    }

    console.error("[PATCH /api/items/[id]]", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteItem(params.id);
    return NextResponse.json({ ok: true, data: { deleted: true } });
  } catch (error: any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { ok: false, error: "Item not found" },
        { status: 404 }
      );
    }

    if (error.message?.includes("in") && error.message?.includes("Buchungen")) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 409 }
      );
    }

    console.error("[DELETE /api/items/[id]]", error);
    return NextResponse.json(
      { ok: false, error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
