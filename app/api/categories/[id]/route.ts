import { NextRequest, NextResponse } from "next/server";
import {
  getCategoryById,
  updateCategory,
  deleteCategory,
  updateCategorySchema,
} from "@/src/lib/services/category";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await getCategoryById(params.id);

    if (!category) {
      return NextResponse.json(
        { ok: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: category });
  } catch (error) {
    console.error("[GET /api/categories/[id]]", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch category" },
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
    const parsed = updateCategorySchema.safeParse(body);

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

    const category = await updateCategory(params.id, parsed.data);

    return NextResponse.json({ ok: true, data: category });
  } catch (error: any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { ok: false, error: "Category not found" },
        { status: 404 }
      );
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        { ok: false, error: "Slug bereits vergeben" },
        { status: 409 }
      );
    }

    console.error("[PATCH /api/categories/[id]]", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteCategory(params.id);
    return NextResponse.json({ ok: true, data: { deleted: true } });
  } catch (error: any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { ok: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Custom error from service layer (category has items)
    if (error.message?.includes("hat noch")) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 409 }
      );
    }

    console.error("[DELETE /api/categories/[id]]", error);
    return NextResponse.json(
      { ok: false, error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
