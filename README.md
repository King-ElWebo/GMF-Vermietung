# GMF Booking – Miet-Buchungssystem

Minimales, production-taugliches Grundgerüst für ein Miet-Buchungssystem.

## Tech Stack

- **Next.js 14** App Router + TypeScript
- **Prisma** ORM + **PostgreSQL** (lokal via Docker)
- **Zod** für ENV- und Request-Validierung
- Kein Auth, kein UI-Framework, kein Mailer (kommt später)

---

## Projektstruktur

```
gmf-booking/
├── app/
│   ├── api/
│   │   ├── health/route.ts          # GET  /api/health
│   │   ├── items/route.ts           # GET  /api/items
│   │   ├── availability/route.ts    # POST /api/availability
│   │   └── bookings/
│   │       ├── route.ts             # POST /api/bookings
│   │       └── [id]/route.ts        # PATCH /api/bookings/:id
│   ├── layout.tsx
│   └── page.tsx                     # Test-Seite (Server Component)
├── src/lib/
│   ├── config/
│   │   └── env.ts                   # Zod ENV Loader
│   ├── server/
│   │   └── prisma.ts                # Prisma Client Singleton
│   └── services/
│       ├── availability.ts          # Verfügbarkeitslogik
│       └── booking.ts               # Buchungslogik + Zod-Schemas
├── prisma/
│   ├── schema.prisma                # Datenmodell
│   └── seed.ts                      # Demo-Daten
├── .env.example
├── docker-compose.yml
└── package.json
```

---

## Lokales Setup

### 1. Dependencies installieren

```bash
npm install
```

### 2. PostgreSQL starten

```bash
npm run db:up
# oder direkt: docker compose up -d
```

### 3. `.env.local` erstellen

```bash
cp .env.example .env.local
```

Dann in `.env.local` ausfüllen:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gmf
DIRECT_URL=postgresql://postgres:postgres@localhost:5432/gmf
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Migration ausführen

```bash
npm run prisma:migrate
# Name z.B.: "init"
```

### 5. Seed-Daten laden

```bash
npm run prisma:seed
```

### 6. Dev-Server starten

```bash
npm run dev
```

→ Öffne http://localhost:3000 – die Seite zeigt live JSON von `/api/health` und `/api/items`.

---

## API Endpoints

| Method | Path | Beschreibung |
|--------|------|--------------|
| GET | `/api/health` | Service-Health |
| GET | `/api/items` | Alle aktiven Items (inkl. Category + Images) |
| POST | `/api/availability` | Verfügbarkeit prüfen |
| POST | `/api/bookings` | Neue Buchung erstellen |
| PATCH | `/api/bookings/:id` | Status einer Buchung ändern |

---

## Test-Curls

### Health Check

```bash
curl http://localhost:3000/api/health
```

### Items abrufen

```bash
curl http://localhost:3000/api/items | jq .
```

### Verfügbarkeit prüfen

Ersetze `ITEM_ID_1` mit einer echten Item-ID aus `/api/items`.

```bash
curl -X POST http://localhost:3000/api/availability \
  -H "Content-Type: application/json" \
  -d '{
    "startAt": "2025-08-01T10:00:00.000Z",
    "endAt": "2025-08-01T18:00:00.000Z",
    "items": [
      { "itemId": "ITEM_ID_1", "quantity": 1 }
    ]
  }' | jq .
```

### Buchung erstellen

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Max Mustermann",
    "customerEmail": "max@example.com",
    "customerPhone": "+49 171 1234567",
    "startAt": "2025-08-10T09:00:00.000Z",
    "endAt": "2025-08-10T17:00:00.000Z",
    "deliveryType": "PICKUP",
    "notes": "Bitte pünktlich",
    "items": [
      { "itemId": "ITEM_ID_1", "quantity": 1 }
    ]
  }' | jq .
```

### Buchung genehmigen

Ersetze `BOOKING_ID` mit der ID aus dem vorherigen Response.

```bash
curl -X PATCH http://localhost:3000/api/bookings/BOOKING_ID \
  -H "Content-Type: application/json" \
  -d '{ "status": "APPROVED" }' | jq .
```

### Buchung mit Lieferung

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Anna Schmidt",
    "customerEmail": "anna@example.com",
    "startAt": "2025-09-05T08:00:00.000Z",
    "endAt": "2025-09-05T20:00:00.000Z",
    "deliveryType": "DELIVERY",
    "deliveryAddress": "Hauptstraße 42, 10115 Berlin",
    "items": [
      { "itemId": "ITEM_ID_1", "quantity": 1 },
      { "itemId": "ITEM_ID_2", "quantity": 2 }
    ]
  }' | jq .
```

---

## Supabase Deployment

Ändere in `.env.local` (oder ENV-Vars auf dem Server):

```env
DATABASE_URL=postgresql://postgres.[ref]:[pw]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[ref]:[pw]@aws-0-[region].pooler.supabase.com:5432/postgres
```

Danach:

```bash
npm run prisma:migrate  # wendet Migrations direkt auf Supabase an
npm run prisma:seed     # optional Demo-Daten
```

---

## Scripts Übersicht

```bash
npm run dev              # Next.js Dev-Server
npm run build            # Production Build
npm run db:up            # Docker Postgres starten
npm run db:down          # Docker Postgres stoppen
npm run prisma:migrate   # Migration ausführen
npm run prisma:seed      # Seed-Daten laden
npm run prisma:studio    # Prisma Studio öffnen
npm run prisma:generate  # Client neu generieren
```
