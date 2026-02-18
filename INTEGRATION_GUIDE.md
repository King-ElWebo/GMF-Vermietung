# 🎯 Admin-Oberfläche Integration Guide

Diese Anleitung zeigt, wie du die neue Admin-Oberfläche in dein bestehendes GMF Booking Projekt integrierst.

---

## 📦 Was wurde gebaut?

### **Neue Dateien**
- ✅ 8 Admin Pages (Dashboard, Categories CRUD, Items CRUD)
- ✅ 5 Komponenten (Nav, Forms, Dialog, Toast)
- ✅ 3 Utility Functions (slugify, fetcher, formatters)
- ✅ 2 Service Layer (category.ts, item.ts)
- ✅ 5 API Routes (Categories + Items CRUD)

### **Angepasste Dateien**
- ⚠️ `app/api/items/route.ts` – **POST hinzugefügt** (GET bleibt)

---

## 🚀 Installation (5 Schritte)

### 1️⃣ **Dateien kopieren**

Kopiere alle Dateien aus diesem ZIP in dein Projekt:

```
gmf-booking/
├── app/
│   ├── admin/                          [NEU - komplett]
│   └── api/
│       ├── categories/                 [NEU - komplett]
│       ├── items/
│       │   ├── route.ts                [ERWEITERT - siehe unten]
│       │   └── [id]/route.ts           [NEU]
├── components/
│   └── admin/                          [NEU - komplett]
├── lib/
│   └── utils/                          [NEU - komplett]
└── src/lib/services/
    ├── category.ts                     [NEU]
    └── item.ts                         [NEU]
```

### 2️⃣ **API Route erweitern**

Deine bestehende `app/api/items/route.ts` hat nur **GET**. Ersetze sie komplett mit der neuen Version (hat GET + POST).

**WICHTIG:** Alte Datei sichern, dann neue verwenden.

### 3️⃣ **Tailwind CSS (falls noch nicht vorhanden)**

Wenn Tailwind noch nicht installiert ist:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**tailwind.config.js:**
```js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**app/globals.css** (oder erstellen):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4️⃣ **Layout anpassen (optional)**

Wenn du kein `app/globals.css` in deinem Root-Layout hast:

**app/layout.tsx:**
```tsx
import './globals.css'  // ← Diese Zeile hinzufügen

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
```

### 5️⃣ **Server starten**

```bash
npm run dev
```

---

## 🧪 Testen

### **URLs:**
- http://localhost:3000/admin → Dashboard
- http://localhost:3000/admin/categories → Kategorien-Liste
- http://localhost:3000/admin/items → Items-Liste

### **Test-Workflow:**

#### **1. Kategorie erstellen**
```
1. Öffne: http://localhost:3000/admin/categories
2. Klick: "+ Neue Kategorie"
3. Eingabe:
   - Name: "Test Kategorie"
   - Slug: wird automatisch generiert (test-kategorie)
4. Klick: "Erstellen"
5. Prüfe: Kategorie erscheint in der Liste
```

#### **2. Item erstellen**
```
1. Öffne: http://localhost:3000/admin/items
2. Klick: "+ Neues Item"
3. Eingabe:
   - Name: "Test Item"
   - Slug: wird automatisch generiert
   - Kategorie: "Test Kategorie" auswählen
   - Bestand: 5
   - Preis: 99.99
   - Kaution: 30.00
   - Bilder: https://placehold.co/800x600?text=Test
4. Klick: "Erstellen"
5. Prüfe: Item erscheint in der Liste
```

#### **3. Item bearbeiten**
```
1. Klick: "Bearbeiten" beim Test-Item
2. Ändere: Preis auf 79.99
3. Klick: "Speichern"
4. Prüfe: Änderung in der Liste sichtbar
```

#### **4. Löschen (mit Validierung)**
```
Kategorie mit Items:
1. Versuch: Kategorie löschen (die Items hat)
2. Erwartung: Fehlermeldung "hat noch X Items"

Item in Buchungen:
1. Erstelle Buchung via API (siehe unten)
2. Versuch: Item löschen
3. Erwartung: Fehlermeldung "in X Buchungen"
```

---

## 🧪 API Tests (cURL)

### **Kategorien**

**GET alle:**
```bash
curl http://localhost:3000/api/categories | jq .
```

**POST erstellen:**
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "API Test", "slug": "api-test"}' | jq .
```

**PATCH ändern:**
```bash
# ID aus GET holen
curl -X PATCH http://localhost:3000/api/categories/CATEGORY_ID \
  -H "Content-Type: application/json" \
  -d '{"name": "API Test Updated", "slug": "api-test"}' | jq .
```

**DELETE:**
```bash
curl -X DELETE http://localhost:3000/api/categories/CATEGORY_ID | jq .
```

### **Items**

**GET mit Filtern:**
```bash
# Alle aktiven
curl "http://localhost:3000/api/items?active=true" | jq .

# Nach Kategorie
curl "http://localhost:3000/api/items?categoryId=CATEGORY_ID" | jq .

# Suche
curl "http://localhost:3000/api/items?search=test" | jq .
```

**POST erstellen:**
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test Item",
    "slug": "api-test-item",
    "categoryId": "CATEGORY_ID",
    "active": true,
    "stockQuantity": 3,
    "priceCents": 15000,
    "depositCents": 5000,
    "bufferBeforeMin": 60,
    "bufferAfterMin": 60,
    "images": [
      {"url": "https://placehold.co/800x600?text=API", "sortOrder": 0}
    ]
  }' | jq .
```

**PATCH ändern:**
```bash
curl -X PATCH http://localhost:3000/api/items/ITEM_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "slug": "api-test-item",
    "categoryId": "CATEGORY_ID",
    "active": false,
    "stockQuantity": 5,
    "priceCents": 20000,
    "depositCents": 7500,
    "bufferBeforeMin": 90,
    "bufferAfterMin": 90,
    "images": []
  }' | jq .
```

---

## 🎨 Features im Detail

### **Auto-Slug Generation**
- Tippt User "Hüpfburg Classic", wird Slug automatisch zu "huepfburg-classic"
- Umlaut-Konvertierung: ä→ae, ö→oe, ü→ue, ß→ss
- Manuell editierbar (deaktiviert dann Auto-Modus)

### **Smart Validierung**
- Slug nur Kleinbuchstaben + Zahlen + Bindestriche
- Kategorie löschen: blockiert wenn Items vorhanden
- Item löschen: blockiert wenn in Buchungen verwendet
- Unique Constraint Errors werden abgefangen

### **Preis-Formatierung**
- Eingabe: 150.00 (Euro)
- Speicherung: 15000 (Cents)
- Anzeige: €150,00

### **Bilder-Verwaltung**
- Dynamische Liste (hinzufügen/entfernen)
- `sortOrder` automatisch basierend auf Position

---

## ⚠️ Was du wissen musst

### **Keine Auth**
- Admin ist **öffentlich** zugänglich
- Für Production: Middleware + Auth hinzufügen

### **Keine Buchungs-Verwaltung**
- Dashboard zeigt "Buchungen (bald verfügbar)"
- API für Buchungen existiert bereits (`/api/bookings`)
- UI kann später ergänzt werden

### **Tailwind erforderlich**
- Alle Komponenten nutzen Tailwind
- Falls nicht gewünscht: manuelles Styling notwendig

---

## 🔧 Troubleshooting

### **"Module not found: lib/utils/slugify"**
→ Prüfe ob `lib/utils/` Ordner existiert und Dateien korrekt kopiert

### **"Prisma Client not found"**
→ `npm run prisma:generate` ausführen

### **"DATABASE_URL not found"**
→ `.env.local` prüfen (siehe Haupt-README)

### **Tailwind Styles nicht sichtbar**
→ `globals.css` in Root-Layout importiert?
→ `tailwind.config.js` hat korrekten `content` Pfad?

### **API 500 Error**
→ Browser Console + Server Logs prüfen
→ Prisma Schema aktuell? (`npm run prisma:migrate`)

---

## 📚 Code-Struktur

### **Service Layer Pattern**
```typescript
// src/lib/services/category.ts
export async function createCategory(input: CreateCategoryInput) {
  return prisma.category.create({ data: input });
}

// app/api/categories/route.ts
const category = await createCategory(parsed.data);
```
→ Business-Logik getrennt von API Routes

### **Typed Fetcher**
```typescript
// lib/utils/fetcher.ts
export const api = {
  get: <T>(url: string) => fetcher<T>(url),
  post: <T>(url: string, data: any) => ...
}

// components/admin/CategoryForm.tsx
const res = await api.post<{ok: boolean; data: Category}>('/api/categories', {name, slug});
```
→ Type-Safe API Calls

---

## 🚀 Nächste Schritte (optional)

1. **Auth hinzufügen:**
   - NextAuth.js oder Clerk
   - Middleware für `/admin/*`

2. **Buchungs-Verwaltung:**
   - Liste mit Status-Filter
   - Detail-View mit BookingItems
   - Approve/Reject Buttons

3. **Image Upload:**
   - Ersetzt URL-Eingabe
   - Supabase Storage / S3
   - Drag & Drop

4. **Kalender-Sync:**
   - Google Calendar API
   - Felder `calendarEventId`/`calendarStatus` nutzen

---

## 📞 Support

Bei Fragen/Problemen:
1. Server Logs prüfen (`npm run dev`)
2. Browser Console öffnen (F12)
3. API direkt via cURL testen

Viel Erfolg! 🎉
