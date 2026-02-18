import { prisma } from "@/src/lib/server/prisma";
import { z } from "zod";

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  slug: z.string().min(1, "Slug ist erforderlich").regex(/^[a-z0-9-]+$/, "Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten"),
});

export const updateCategorySchema = createCategorySchema;

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

// ─── Service Functions ────────────────────────────────────────────────────────

export async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { items: true },
      },
    },
  });
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { items: true },
      },
    },
  });
}

export async function createCategory(input: CreateCategoryInput) {
  return prisma.category.create({
    data: input,
  });
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  return prisma.category.update({
    where: { id },
    data: input,
  });
}

export async function deleteCategory(id: string) {
  // Check if category has items
  const itemCount = await prisma.item.count({
    where: { categoryId: id },
  });

  if (itemCount > 0) {
    throw new Error(`Kategorie hat noch ${itemCount} Items und kann nicht gelöscht werden`);
  }

  return prisma.category.delete({
    where: { id },
  });
}
