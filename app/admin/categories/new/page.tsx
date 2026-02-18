import { CategoryForm } from "@/components/admin/CategoryForm";

export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Neue Kategorie
      </h1>
      <CategoryForm mode="create" />
    </div>
  );
}
