import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkAvailability } from "@/src/lib/services/availability";

export const dynamic = "force-dynamic";

const availabilityRequestSchema = z
  .object({
    startAt: z.string().datetime(),
    endAt: z.string().datetime(),
    items: z
      .array(
        z.object({
          itemId: z.string().cuid(),
          quantity: z.number().int().min(1),
        })
      )
      .min(1, "At least one item is required"),
  })
  .refine((d) => new Date(d.endAt) > new Date(d.startAt), {
    message: "endAt must be after startAt",
    path: ["endAt"],
  });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = availabilityRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { startAt, endAt, items } = parsed.data;

    const result = await checkAvailability({
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      items,
    });

    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    console.error("[POST /api/availability]", error);
    return NextResponse.json(
      { ok: false, error: "Availability check failed" },
      { status: 500 }
    );
  }
}
