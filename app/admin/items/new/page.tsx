import { getAllCategories } from "@/src/lib/services/category";
import { ItemForm } from "@/components/admin/ItemForm";

export default async function NewItemPage() {
  const categories = await getAllCategories();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Neues Item</h1>
      <ItemForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        mode="create"
      />
    </div>
  );
}
