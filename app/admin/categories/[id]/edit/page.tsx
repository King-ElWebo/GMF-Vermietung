"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { api } from "@/lib/utils/fetcher";
import { CategoryForm } from "@/components/admin/CategoryForm";

export default function EditCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/api/categories/${params.id}`)
      .then((res: any) => setCategory(res.data))
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

  if (!category) return notFound();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Kategorie bearbeiten
      </h1>
      <CategoryForm category={category} mode="edit" />
    </div>
  );
}
