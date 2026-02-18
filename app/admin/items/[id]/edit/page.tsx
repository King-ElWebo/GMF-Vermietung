"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { api } from "@/lib/utils/fetcher";
import { ItemForm } from "@/components/admin/ItemForm";

export default function EditItemPage({
  params,
}: {
  params: { id: string };
}) {
  const [item, setItem] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/api/items/${params.id}`),
      api.get("/api/categories"),
    ])
      .then(([itemRes, catsRes]: any[]) => {
        setItem(itemRes.data);
        setCategories(catsRes.data);
      })
      .catch(() => notFound())
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Laden...</div>
      </div>
    );
  }

  if (!item) return notFound();

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
