import { NextRequest, NextResponse } from "next/server";
import {
  updateBookingStatus,
  updateBookingStatusSchema,
} from "@/src/lib/services/booking";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const parsed = updateBookingStatusSchema.safeParse(body);

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

    const booking = await updateBookingStatus(params.id, parsed.data);

    return NextResponse.json({ ok: true, data: booking });
  } catch (error) {
    // Prisma "record not found" → 404
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { ok: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    console.error("[PATCH /api/bookings/[id]]", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
