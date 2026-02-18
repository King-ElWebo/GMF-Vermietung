"use client";

import { useEffect, useState } from "react";
import { ItemForm } from "@/components/admin/ItemForm";
import { api } from "@/lib/utils/fetcher";

export default function NewItemPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/categories")
      .then((res: any) => setCategories(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Laden...</div>
      </div>
    );
  }

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
