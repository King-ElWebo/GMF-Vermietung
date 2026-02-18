import { prisma } from "@/src/lib/server/prisma";
import { BookingStatus, DeliveryType } from "@prisma/client";
import { z } from "zod";

// ─── Zod Schemas (also exported for use in Route Handlers) ───────────────────

export const createBookingSchema = z
  .object({
    customerName: z.string().min(1),
    customerEmail: z.string().email(),
    customerPhone: z.string().optional(),
    startAt: z.string().datetime(),
    endAt: z.string().datetime(),
    deliveryType: z.nativeEnum(DeliveryType),
    deliveryAddress: z.string().optional(),
    notes: z.string().optional(),
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
  })
  .refine(
    (d) =>
      d.deliveryType !== "DELIVERY" ||
      (d.deliveryAddress && d.deliveryAddress.length > 0),
    {
      message: "deliveryAddress is required for DELIVERY type",
      path: ["deliveryAddress"],
    }
  );

export const updateBookingStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "CANCELLED"]),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;

// ─── Service ──────────────────────────────────────────────────────────────────

export async function createBooking(input: CreateBookingInput) {
  const { items, startAt, endAt, ...fields } = input;

  const booking = await prisma.booking.create({
    data: {
      ...fields,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      status: BookingStatus.REQUESTED,
      bookingItems: {
        create: items.map(({ itemId, quantity }) => ({ itemId, quantity })),
      },
    },
    select: {
      id: true,
      status: true,
      startAt: true,
      endAt: true,
      customerName: true,
      customerEmail: true,
      bookingItems: {
        select: { itemId: true, quantity: true },
      },
    },
  });

  return booking;
}

export async function updateBookingStatus(
  bookingId: string,
  input: UpdateBookingStatusInput
) {
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: input.status as BookingStatus },
    select: {
      id: true,
      status: true,
      updatedAt: true,
    },
  });

  return booking;
}
