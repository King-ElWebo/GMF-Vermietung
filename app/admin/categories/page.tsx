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
      <div className="flex justify-center items-center h-96">
        <div className="text-xl text-gray-500">Laden...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Kategorien</h1>
          <p className="text-lg text-gray-600">
            {categories.length} {categories.length === 1 ? "Kategorie" : "Kategorien"}
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200"
        >
          + Neue Kategorie
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-6">📁</div>
          <p className="text-xl text-gray-600 mb-6">Noch keine Kategorien vorhanden</p>
          <Link
            href="/admin/categories/new"
            className="inline-block px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Erste Kategorie erstellen →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Anzahl Items
                </th>
                <th className="px-8 py-5 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50 transition">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="text-lg font-semibold text-gray-900">
                      {category.name}
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <code className="text-base text-gray-600 bg-gray-100 px-3 py-1 rounded">
                      {category.slug}
                    </code>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-base font-semibold bg-blue-100 text-blue-800">
                      {category._count.items}
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-right text-base font-medium space-x-4">
                    <Link
                      href={`/admin/categories/${category.id}/edit`}
                      className="inline-block px-5 py-2.5 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition font-semibold"
                    >
                      ✏️ Bearbeiten
                    </Link>
                    <button
                      onClick={() =>
                        setDeleteDialog({ isOpen: true, category })
                      }
                      className="inline-block px-5 py-2.5 text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition font-semibold"
                    >
                      🗑️ Löschen
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
