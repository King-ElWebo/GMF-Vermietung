"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/utils/fetcher";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { Toast } from "@/components/admin/Toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { items: number };
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    category: Category | null;
  }>({ isOpen: false, category: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get<{ ok: boolean; data: Category[] }>(
        "/api/categories"
      );
      setCategories(res.data);
    } catch (error) {
      console.error(error);
      setToast({ message: "Fehler beim Laden", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.category) return;

    setIsDeleting(true);
    try {
      await api.delete(`/api/categories/${deleteDialog.category.id}`);
      setToast({ message: "Kategorie gelöscht", type: "success" });
      setDeleteDialog({ isOpen: false, category: null });
      fetchCategories();
    } catch (error: any) {
      setToast({
        message: error.data?.error || "Fehler beim Löschen",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Laden...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Kategorien</h1>
        <Link
          href="/admin/categories/new"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          + Neue Kategorie
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">Noch keine Kategorien vorhanden</p>
          <Link
            href="/admin/categories/new"
            className="text-blue-600 hover:text-blue-700"
          >
            Erste Kategorie erstellen →
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category._count.items}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <Link
                      href={`/admin/categories/${category.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Bearbeiten
                    </Link>
                    <button
                      onClick={() =>
                        setDeleteDialog({ isOpen: true, category })
                      }
                      className="text-red-600 hover:text-red-900"
                    >
                      Löschen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, category: null })}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Kategorie löschen"
        message={
          deleteDialog.category?._count.items
            ? `Diese Kategorie hat noch ${deleteDialog.category._count.items} Items und kann nicht gelöscht werden.`
            : "Möchten Sie diese Kategorie wirklich löschen?"
        }
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
