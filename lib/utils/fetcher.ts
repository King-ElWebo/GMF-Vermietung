/**
 * Type-safe fetch wrapper for API calls
 */

export class FetchError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`${status}: ${statusText}`);
    this.name = "FetchError";
  }
}

export async function fetcher<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new FetchError(res.status, res.statusText, data);
  }

  return res.json();
}

export const api = {
  get: <T>(url: string) => fetcher<T>(url),
  
  post: <T>(url: string, data: any) =>
    fetcher<T>(url, { method: "POST", body: JSON.stringify(data) }),
  
  patch: <T>(url: string, data: any) =>
    fetcher<T>(url, { method: "PATCH", body: JSON.stringify(data) }),
  
  delete: <T>(url: string) =>
    fetcher<T>(url, { method: "DELETE" }),
};
