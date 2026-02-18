import { prisma } from "@/src/lib/server/prisma";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AvailabilityInput {
  startAt: Date;
  endAt: Date;
  items: Array<{ itemId: string; quantity: number }>;
}

export interface AvailabilityDetail {
  itemId: string;
  requestedQty: number;
  availableQty: number;
}

export interface AvailabilityResult {
  ok: boolean;
  details: AvailabilityDetail[];
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Check whether all requested items are available for the given time window.
 *
 * Rules:
 *  - Only APPROVED bookings block inventory.
 *  - Overlap condition: booking.startAt < endAt AND booking.endAt > startAt
 *  - availableQty = item.stockQuantity − Σ(approved overlapping quantities)
 */
export async function checkAvailability(
  input: AvailabilityInput
): Promise<AvailabilityResult> {
  const { startAt, endAt, items } = input;

  const itemIds = items.map((i) => i.itemId);

  // Fetch stock quantities for all requested items in one query
  const dbItems = await prisma.item.findMany({
    where: { id: { in: itemIds }, active: true },
    select: { id: true, stockQuantity: true },
  });

  const stockMap = new Map(dbItems.map((i) => [i.id, i.stockQuantity]));

  // Fetch all approved BookingItems that overlap with the requested window
  const overlappingBookingItems = await prisma.bookingItem.findMany({
    where: {
      itemId: { in: itemIds },
      booking: {
        status: "APPROVED",
        startAt: { lt: endAt },   // booking starts before our window ends
        endAt: { gt: startAt },   // booking ends after our window starts
      },
    },
    select: { itemId: true, quantity: true },
  });

  // Sum up booked quantities per item
  const bookedMap = new Map<string, number>();
  for (const bi of overlappingBookingItems) {
    bookedMap.set(bi.itemId, (bookedMap.get(bi.itemId) ?? 0) + bi.quantity);
  }

  // Build result details
  const details: AvailabilityDetail[] = items.map(({ itemId, quantity }) => {
    const stock = stockMap.get(itemId) ?? 0;
    const booked = bookedMap.get(itemId) ?? 0;
    return {
      itemId,
      requestedQty: quantity,
      availableQty: stock - booked,
    };
  });

  const ok = details.every((d) => d.availableQty >= d.requestedQty);

  return { ok, details };
}
