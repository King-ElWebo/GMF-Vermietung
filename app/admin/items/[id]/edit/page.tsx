import { notFound } from "next/navigation";
import { getItemById } from "@/src/lib/services/item";
import { getAllCategories } from "@/src/lib/services/category";
import { ItemForm } from "@/components/admin/ItemForm";

export default async function EditItemPage({
  params,
}: {
  params: { id: string };
}) {
  const [item, categories] = await Promise.all([
    getItemById(params.id),
    getAllCategories(),
  ]);

  if (!item) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Item bearbeiten
      </h1>
      <ItemForm
        item={item}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        mode="edit"
      />
    </div>
  );
}
