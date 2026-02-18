/**
 * Format cents to Euro display
 */
export function formatCents(cents: number | null | undefined): string {
  if (cents == null) return "–";
  return `€${(cents / 100).toFixed(2).replace(".", ",")}`;
}

/**
 * Parse Euro input to cents
 */
export function parseCentsInput(value: string): number | null {
  if (!value || value.trim() === "") return null;
  const num = parseFloat(value.replace(",", "."));
  return isNaN(num) ? null : Math.round(num * 100);
}

/**
 * Format cents for input field (Euro value)
 */
export function formatCentsForInput(cents: number | null | undefined): string {
  if (cents == null) return "";
  return (cents / 100).toFixed(2);
}
