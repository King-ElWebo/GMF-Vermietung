"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils/slugify";
import { api } from "@/lib/utils/fetcher";
import { Toast } from "./Toast";

interface CategoryFormProps {
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  mode: "create" | "edit";
}

export function CategoryForm({ category, mode }: CategoryFormProps) {
  const router = useRouter();
  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [autoSlug, setAutoSlug] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (autoSlug && name) {
      setSlug(slugify(name));
    }
  }, [name, autoSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === "create") {
        await api.post("/api/categories", { name, slug });
        setToast({ message: "Kategorie erstellt", type: "success" });
      } else {
        await api.patch(`/api/categories/${category!.id}`, { name, slug });
        setToast({ message: "Kategorie gespeichert", type: "success" });
      }

      setTimeout(() => router.push("/admin/categories"), 1000);
    } catch (err: any) {
      console.error(err);
      setError(err.data?.error || "Ein Fehler ist aufgetreten");
      setToast({ message: err.data?.error || "Fehler", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-8">
        <div className="space-y-8">
          <div>
            <label className="block text-lg font-bold text-gray-900 mb-3">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="z.B. Hüpfburgen"
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-gray-900 mb-3">
              Slug *
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setAutoSlug(false);
              }}
              required
              pattern="[a-z0-9-]+"
              className="w-full px-5 py-4 text-lg font-mono border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="z.B. huepfburgen"
            />
            <p className="mt-2 text-sm text-gray-600">
              ℹ️ Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-5 bg-red-50 border-2 border-red-200 rounded-lg text-base text-red-700 font-semibold">
            ❌ {error}
          </div>
        )}

        <div className="mt-10 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push("/admin/categories")}
            className="px-6 py-3 text-base font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 text-base font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200"
          >
            {isSubmitting
              ? "Speichern..."
              : mode === "create"
              ? "✅ Erstellen"
              : "💾 Speichern"}
          </button>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
