const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

async function getHealth() {
  try {
    const res = await fetch(`${BASE_URL}/api/health`, {
      cache: "no-store",
    });
    return res.json();
  } catch {
    return { error: "Could not reach /api/health" };
  }
}

async function getItems() {
  try {
    const res = await fetch(`${BASE_URL}/api/items`, {
      cache: "no-store",
    });
    return res.json();
  } catch {
    return { error: "Could not reach /api/items" };
  }
}

export default async function HomePage() {
  const [health, items] = await Promise.all([getHealth(), getItems()]);

  return (
    <main>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
        GMF Booking – API Test Page
      </h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        Diese Seite zeigt die Live-Antworten der API-Endpunkte (kein Cache).
      </p>

      <section>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
          GET /api/health
        </h2>
        <pre
          style={{
            background: "#f4f4f4",
            padding: "1rem",
            borderRadius: "4px",
            overflow: "auto",
            fontSize: "0.85rem",
          }}
        >
          {JSON.stringify(health, null, 2)}
        </pre>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
          GET /api/items
        </h2>
        <pre
          style={{
            background: "#f4f4f4",
            padding: "1rem",
            borderRadius: "4px",
            overflow: "auto",
            fontSize: "0.85rem",
            maxHeight: "600px",
          }}
        >
          {JSON.stringify(items, null, 2)}
        </pre>
      </section>
    </main>
  );
}
