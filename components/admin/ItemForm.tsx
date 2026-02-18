"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils/slugify";
import { formatCentsForInput, parseCentsInput } from "@/lib/utils/formatters";
import { api } from "@/lib/utils/fetcher";
import { Toast } from "./Toast";

interface ItemFormProps {
  item?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    categoryId: string;
    active: boolean;
    stockQuantity: number;
    priceCents: number | null;
    depositCents: number | null;
    bufferBeforeMin: number;
    bufferAfterMin: number;
    images: Array<{ url: string; sortOrder: number }>;
  };
  categories: Array<{ id: string; name: string }>;
  mode: "create" | "edit";
}

export function ItemForm({ item, categories, mode }: ItemFormProps) {
  const router = useRouter();
  const [name, setName] = useState(item?.name || "");
  const [slug, setSlug] = useState(item?.slug || "");
  const [autoSlug, setAutoSlug] = useState(!item);
  const [description, setDescription] = useState(item?.description || "");
  const [categoryId, setCategoryId] = useState(item?.categoryId || "");
  const [active, setActive] = useState(item?.active ?? true);
  const [stockQuantity, setStockQuantity] = useState(item?.stockQuantity?.toString() || "1");
  const [price, setPrice] = useState(formatCentsForInput(item?.priceCents));
  const [deposit, setDeposit] = useState(formatCentsForInput(item?.depositCents));
  const [bufferBefore, setBufferBefore] = useState(item?.bufferBeforeMin?.toString() || "0");
  const [bufferAfter, setBufferAfter] = useState(item?.bufferAfterMin?.toString() || "0");
  const [images, setImages] = useState<string[]>(
    item?.images.sort((a, b) => a.sortOrder - b.sortOrder).map((img) => img.url) || [""]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (autoSlug && name) {
      setSlug(slugify(name));
    }
  }, [name, autoSlug]);

  const handleAddImage = () => {
    setImages([...images, ""]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        name,
        slug,
        description: description || undefined,
        categoryId,
        active,
        stockQuantity: parseInt(stockQuantity, 10),
        priceCents: parseCentsInput(price),
        depositCents: parseCentsInput(deposit),
        bufferBeforeMin: parseInt(bufferBefore, 10),
        bufferAfterMin: parseInt(bufferAfter, 10),
        images: images
          .filter((url) => url.trim() !== "")
          .map((url, index) => ({ url, sortOrder: index })),
      };

      if (mode === "create") {
        await api.post("/api/items", payload);
        setToast({ message: "Item erstellt", type: "success" });
      } else {
        await api.patch(`/api/items/${item!.id}`, payload);
        setToast({ message: "Item gespeichert", type: "success" });
      }

      setTimeout(() => router.push("/admin/items"), 1000);
    } catch (err: any) {
      console.error(err);
      setError(err.data?.error || "Ein Fehler ist aufgetreten");
      setToast({ message: err.data?.error || "Fehler", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategorie *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Bitte wählen</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beschreibung
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Stock & Pricing */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Bestand & Preise</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bestand *
                </label>
                <input
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preis (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="150.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kaution (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  placeholder="50.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Buffer Times */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pufferzeiten</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Puffer Vorher (Min)
                </label>
                <input
                  type="number"
                  value={bufferBefore}
                  onChange={(e) => setBufferBefore(e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Puffer Nachher (Min)
                </label>
                <input
                  type="number"
                  value={bufferAfter}
                  onChange={(e) => setBufferAfter(e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Bilder</h3>
            <div className="space-y-3">
              {images.map((url, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100"
                  >
                    Entfernen
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100"
              >
                + Bild hinzufügen
              </button>
            </div>
          </div>

          {/* Active Toggle */}
          <div className="border-t pt-6">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Item ist aktiv (buchbar)
              </span>
            </label>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push("/admin/items")}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting
              ? "Speichern..."
              : mode === "create"
              ? "Erstellen"
              : "Speichern"}
          </button>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
