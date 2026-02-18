/**
 * Generate URL-safe slug from text
 * Converts: "Hüpfburg Classic 4x4" → "huepfburg-classic-4x4"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD") // Decompose umlauts
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with dash
    .replace(/^-+|-+$/g, ""); // Trim dashes
}
