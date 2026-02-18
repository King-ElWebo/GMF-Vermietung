import { prisma } from "@/src/lib/server/prisma";
import { z } from "zod";

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const itemImageSchema = z.object({
  url: z.string().url("Ungültige URL"),
  sortOrder: z.number().int().min(0).default(0),
});

export const createItemSchema = z.object({
  categoryId: z.string().cuid("Ungültige Kategorie-ID"),
  name: z.string().min(1, "Name ist erforderlich"),
  slug: z.string().min(1, "Slug ist erforderlich").regex(/^[a-z0-9-]+$/, "Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten"),
  description: z.string().optional(),
  active: z.boolean().default(true),
  stockQuantity: z.number().int().min(0).default(1),
  priceCents: z.number().int().min(0).nullable().optional(),
  depositCents: z.number().int().min(0).nullable().optional(),
  bufferBeforeMin: z.number().int().min(0).default(0),
  bufferAfterMin: z.number().int().min(0).default(0),
  images: z.array(itemImageSchema).default([]),
});

export const updateItemSchema = createItemSchema;

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;

// ─── Service Functions ────────────────────────────────────────────────────────

export async function getAllItems(filters?: {
  categoryId?: string;
  active?: boolean;
  search?: string;
}) {
  return prisma.item.findMany({
    where: {
      ...(filters?.categoryId && { categoryId: filters.categoryId }),
      ...(filters?.active !== undefined && { active: filters.active }),
      ...(filters?.search && {
        OR: [
          { name: { contains: filters.search, mode: "insensitive" } },
          { slug: { contains: filters.search, mode: "insensitive" } },
        ],
      }),
    },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function getItemById(id: string) {
  return prisma.item.findUnique({
    where: { id },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function createItem(input: CreateItemInput) {
  const { images, ...itemData } = input;

  return prisma.item.create({
    data: {
      ...itemData,
      images: {
        create: images,
      },
    },
    include: {
      category: true,
      images: true,
    },
  });
}

export async function updateItem(id: string, input: UpdateItemInput) {
  const { images, ...itemData } = input;

  // Delete existing images and create new ones
  await prisma.itemImage.deleteMany({
    where: { itemId: id },
  });

  return prisma.item.update({
    where: { id },
    data: {
      ...itemData,
      images: {
        create: images,
      },
    },
    include: {
      category: true,
      images: true,
    },
  });
}

export async function deleteItem(id: string) {
  // Check if item is in any bookings
  const bookingCount = await prisma.bookingItem.count({
    where: { itemId: id },
  });

  if (bookingCount > 0) {
    throw new Error(
      `Item ist in ${bookingCount} Buchungen verwendet und kann nicht gelöscht werden`
    );
  }

  return prisma.item.delete({
    where: { id },
  });
}
