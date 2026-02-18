"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/utils/fetcher";
import { formatCents } from "@/lib/utils/formatters";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { Toast } from "@/components/admin/Toast";

interface Item {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  stockQuantity: number;
  priceCents: number | null;
  depositCents: number | null;
  category: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
}

export default function ItemsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "");
  const [activeFilter, setActiveFilter] = useState(searchParams.get("active") || "");
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    item: Item | null;
  }>({ isOpen: false, item: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [search, categoryFilter, activeFilter]);

  const fetchCategories = async () => {
    try {
      const res = await api.get<{ ok: boolean; data: Category[] }>(
        "/api/categories"
      );
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryFilter) params.set("categoryId", categoryFilter);
      if (activeFilter) params.set("active", activeFilter);

      const res = await api.get<{ ok: boolean; data: Item[] }>(
        `/api/items?${params.toString()}`
      );
      setItems(res.data);
    } catch (error) {
      console.error(error);
      setToast({ message: "Fehler beim Laden", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.item) return;

    setIsDeleting(true);
    try {
      await api.delete(`/api/items/${deleteDialog.item.id}`);
      setToast({ message: "Item gelöscht", type: "success" });
      setDeleteDialog({ isOpen: false, item: null });
      fetchItems();
    } catch (error: any) {
      setToast({
        message: error.data?.error || "Fehler beim Löschen",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Items</h1>
          <p className="text-lg text-gray-600">
            {items.length} {items.length === 1 ? "Item" : "Items"}
          </p>
        </div>
        <Link
          href="/admin/items/new"
          className="px-6 py-3 text-lg font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-200"
        >
          + Neues Item
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Filter</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">
              Suche
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name oder Slug..."
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">
              Kategorie
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Alle Kategorien</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">
              Status
            </label>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Alle</option>
              <option value="true">✅ Aktiv</option>
              <option value="false">❌ Inaktiv</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <div className="text-xl text-gray-500">Laden...</div>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-6">🎪</div>
          <p className="text-xl text-gray-600 mb-6">Keine Items gefunden</p>
          <Link
            href="/admin/items/new"
            className="inline-block px-6 py-3 text-lg font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
          >
            Erstes Item erstellen →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Kategorie
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Bestand
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Preis
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Kaution
                  </th>
                  <th className="px-6 py-5 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-5">
                      <div className="text-base font-semibold text-gray-900">
                        {item.name}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="text-base text-gray-600">
                        {item.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1.5 text-sm font-bold rounded-full ${
                          item.active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.active ? "✅ Aktiv" : "❌ Inaktiv"}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="text-base font-semibold text-gray-900">
                        {item.stockQuantity}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="text-base font-semibold text-gray-900">
                        {formatCents(item.priceCents)}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="text-base font-semibold text-gray-900">
                        {formatCents(item.depositCents)}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-base font-medium space-x-3">
                      <Link
                        href={`/admin/items/${item.id}/edit`}
                        className="inline-block px-5 py-2.5 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition font-semibold"
                      >
                        ✏️ Bearbeiten
                      </Link>
                      <button
                        onClick={() => setDeleteDialog({ isOpen: true, item })}
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
        </div>
      )}

      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, item: null })}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Item löschen"
        message="Möchten Sie dieses Item wirklich löschen?"
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
