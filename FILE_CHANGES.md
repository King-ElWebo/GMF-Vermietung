# 📋 Datei-Änderungen Übersicht

## ✅ NEUE Dateien (komplett neu erstellt)

### **Admin Pages** (8 Dateien)
```
app/admin/
├── layout.tsx                          ← Admin Layout mit Navigation
├── page.tsx                            ← Dashboard
├── categories/
│   ├── page.tsx                        ← Kategorien-Liste
│   ├── new/page.tsx                    ← Kategorie erstellen
│   └── [id]/edit/page.tsx              ← Kategorie bearbeiten
└── items/
    ├── page.tsx                        ← Items-Liste mit Filter
    ├── new/page.tsx                    ← Item erstellen
    └── [id]/edit/page.tsx              ← Item bearbeiten
```

### **Components** (5 Dateien)
```
components/admin/
├── AdminNav.tsx                        ← Navigation
├── CategoryForm.tsx                    ← Kategorie-Formular
├── ItemForm.tsx                        ← Item-Formular
├── DeleteConfirmDialog.tsx             ← Lösch-Dialog
└── Toast.tsx                           ← Toast-Benachrichtigung
```

### **Utilities** (3 Dateien)
```
lib/utils/
├── slugify.ts                          ← Slug-Generator
├── fetcher.ts                          ← Typed API Wrapper
└── formatters.ts                       ← Cent ↔ Euro Konvertierung
```

### **Services** (2 Dateien)
```
src/lib/services/
├── category.ts                         ← Category CRUD + Zod
└── item.ts                             ← Item CRUD + Zod
```

### **API Routes** (4 neue, 1 erweitert)
```
app/api/
├── categories/
│   ├── route.ts                        [NEU] GET, POST
│   └── [id]/route.ts                   [NEU] GET, PATCH, DELETE
└── items/
    ├── route.ts                        [ERWEITERT] GET (bestand), POST (neu)
    └── [id]/route.ts                   [NEU] GET, PATCH, DELETE
```

---

## ⚠️ GEÄNDERTE Dateien (1 Datei)

### **app/api/items/route.ts**

**Vorher (nur GET):**
```typescript
export async function GET() {
  try {
    const items = await prisma.item.findMany({
      where: { active: true },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
      include: { category, images },
    });
    return NextResponse.json({ ok: true, data: items });
  } catch (error) {
    // error handling
  }
}
```

**Nachher (GET + POST + Filter):**
```typescript
export async function GET(request: NextRequest) {
  try {
    // ✅ NEU: Query-Parameter für Filter
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const activeParam = searchParams.get("active");
    const search = searchParams.get("search") || undefined;

    const active = activeParam === "true" ? true 
                 : activeParam === "false" ? false 
                 : undefined;

    // ✅ NEU: Service-Layer statt direktem Prisma
    const items = await getAllItems({ categoryId, active, search });
    return NextResponse.json({ ok: true, data: items });
  } catch (error) {
    // error handling
  }
}

// ✅ NEU: POST Endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const item = await createItem(parsed.data);
    return NextResponse.json({ ok: true, data: item }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { ok: false, error: "Slug bereits vergeben" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { ok: false, error: "Failed to create item" },
      { status: 500 }
    );
  }
}
```

**Was sich ändert:**
1. ✅ **GET:** Filter-Parameter hinzugefügt (categoryId, active, search)
2. ✅ **POST:** Komplett neu (Item erstellen)
3. ✅ **Service-Layer:** Nutzt jetzt `getAllItems()` statt direktem Prisma
4. ✅ **Zod-Validierung:** Für POST-Input

**Backward Compatible?**
✅ **JA** – Alte GET-Aufrufe ohne Parameter funktionieren weiterhin!

---

## 📦 KEINE Änderungen an:

- ✅ `prisma/schema.prisma` (bleibt unverändert)
- ✅ `app/page.tsx` (Test-Seite bleibt)
- ✅ `app/layout.tsx` (Root-Layout bleibt)
- ✅ `app/api/health/route.ts` (bleibt)
- ✅ `app/api/availability/route.ts` (bleibt)
- ✅ `app/api/bookings/*` (bleibt)
- ✅ `src/lib/server/prisma.ts` (bleibt)
- ✅ `src/lib/config/env.ts` (bleibt)
- ✅ `src/lib/services/availability.ts` (bleibt)
- ✅ `src/lib/services/booking.ts` (bleibt)

---

## 🎯 Zusammenfassung

| Kategorie | Anzahl | Status |
|-----------|--------|--------|
| Neue Dateien | 22 | ✅ Kopieren |
| Geänderte Dateien | 1 | ⚠️ Ersetzen |
| Unveränderte Dateien | 13 | ✅ Nicht anfassen |

**Total:** 36 Dateien im Projekt, 22 neu hinzugefügt, 1 erweitert.
