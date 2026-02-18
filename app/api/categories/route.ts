import { NextRequest, NextResponse } from "next/server";
import {
  getAllCategories,
  createCategory,
  createCategorySchema,
} from "@/src/lib/services/category";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await getAllCategories();
    return NextResponse.json({ ok: true, data: categories });
  } catch (error) {
    console.error("[GET /api/categories]", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);

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

    const category = await createCategory(parsed.data);

    return NextResponse.json({ ok: true, data: category }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/categories]", error);
    
    // Unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json(
        { ok: false, error: "Slug bereits vergeben" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { ok: false, error: "Failed to create category" },
      { status: 500 }
    );
  }
}
