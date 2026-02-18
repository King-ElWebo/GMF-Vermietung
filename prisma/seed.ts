import { PrismaClient, DeliveryType, BookingStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Categories ──────────────────────────────────────────────────────────────
  const [huepfburgen, audio, partyzelte] = await Promise.all([
    prisma.category.upsert({
      where: { slug: "huepfburgen" },
      update: {},
      create: { name: "Hüpfburgen", slug: "huepfburgen" },
    }),
    prisma.category.upsert({
      where: { slug: "audio" },
      update: {},
      create: { name: "Audio", slug: "audio" },
    }),
    prisma.category.upsert({
      where: { slug: "partyzelte" },
      update: {},
      create: { name: "Partyzelte", slug: "partyzelte" },
    }),
  ]);

  // ── Items ────────────────────────────────────────────────────────────────────
  const itemsData = [
    // Hüpfburgen
    {
      categoryId: huepfburgen.id,
      name: "Hüpfburg Classic 4x4",
      slug: "huepfburg-classic-4x4",
      description: "Klassische Hüpfburg, ideal für Kindergeburtstage.",
      stockQuantity: 2,
      priceCents: 15000,
      depositCents: 5000,
      bufferBeforeMin: 60,
      bufferAfterMin: 60,
      images: [
        "https://placehold.co/800x600?text=H%C3%BCpfburg+Classic",
        "https://placehold.co/800x600?text=H%C3%BCpfburg+Classic+2",
      ],
    },
    {
      categoryId: huepfburgen.id,
      name: "Hüpfburg Schloss XL",
      slug: "huepfburg-schloss-xl",
      description: "Schloss-Design, 5x5 m, mit Rutsche.",
      stockQuantity: 1,
      priceCents: 22000,
      depositCents: 7500,
      bufferBeforeMin: 90,
      bufferAfterMin: 90,
      images: [
        "https://placehold.co/800x600?text=Schloss+XL",
        "https://placehold.co/800x600?text=Schloss+XL+Side",
      ],
    },
    {
      categoryId: huepfburgen.id,
      name: "Hüpfburg Dschungel",
      slug: "huepfburg-dschungel",
      description: "Dschungel-Motiv, perfekt für Outdoor-Events.",
      stockQuantity: 1,
      priceCents: 18000,
      depositCents: 5000,
      bufferBeforeMin: 60,
      bufferAfterMin: 60,
      images: ["https://placehold.co/800x600?text=Dschungel"],
    },
    // Audio
    {
      categoryId: audio.id,
      name: "PA-Set Basic (2x Lautsprecher + Mixer)",
      slug: "pa-set-basic",
      description: "Für Events bis ca. 100 Personen.",
      stockQuantity: 3,
      priceCents: 9500,
      depositCents: 3000,
      bufferBeforeMin: 30,
      bufferAfterMin: 30,
      images: ["https://placehold.co/800x600?text=PA+Basic"],
    },
    {
      categoryId: audio.id,
      name: "DJ-Controller Set",
      slug: "dj-controller-set",
      description: "Pioneer DJ-Controller inkl. Laptop-Ständer.",
      stockQuantity: 2,
      priceCents: 7500,
      depositCents: 2500,
      bufferBeforeMin: 30,
      bufferAfterMin: 30,
      images: [
        "https://placehold.co/800x600?text=DJ+Controller",
        "https://placehold.co/800x600?text=DJ+Setup",
      ],
    },
    {
      categoryId: audio.id,
      name: "Mikrofon-Set (2x Funk)",
      slug: "mikrofon-set-funk",
      description: "2 kabellose Mikrofone inkl. Receiver.",
      stockQuantity: 5,
      priceCents: 3500,
      depositCents: 1000,
      images: ["https://placehold.co/800x600?text=Mikrofon+Set"],
    },
    // Partyzelte
    {
      categoryId: partyzelte.id,
      name: "Festzelt 5x10m",
      slug: "festzelt-5x10",
      description: "Klassisches Festzelt, 50 m², für bis zu 60 Personen.",
      stockQuantity: 2,
      priceCents: 45000,
      depositCents: 15000,
      bufferBeforeMin: 120,
      bufferAfterMin: 120,
      images: [
        "https://placehold.co/800x600?text=Festzelt+5x10",
        "https://placehold.co/800x600?text=Festzelt+Innen",
      ],
    },
    {
      categoryId: partyzelte.id,
      name: "Pavillon 3x3m",
      slug: "pavillon-3x3",
      description: "Leichter Falt-Pavillon, schnell aufgebaut.",
      stockQuantity: 6,
      priceCents: 4500,
      depositCents: 1500,
      bufferBeforeMin: 15,
      bufferAfterMin: 15,
      images: ["https://placehold.co/800x600?text=Pavillon+3x3"],
    },
  ];

  for (const { images, ...itemData } of itemsData) {
    const item = await prisma.item.upsert({
      where: { slug: itemData.slug },
      update: {},
      create: itemData,
    });

    // Only create images if none exist yet
    const existingImages = await prisma.itemImage.count({
      where: { itemId: item.id },
    });
    if (existingImages === 0) {
      await prisma.itemImage.createMany({
        data: images.map((url, idx) => ({
          itemId: item.id,
          url,
          sortOrder: idx,
        })),
      });
    }
  }

  // ── Demo booking ────────────────────────────────────────────────────────────
  const huepfburgClassic = await prisma.item.findUnique({
    where: { slug: "huepfburg-classic-4x4" },
  });

  if (huepfburgClassic) {
    const existing = await prisma.booking.findFirst({
      where: { customerEmail: "demo@example.com" },
    });
    if (!existing) {
      await prisma.booking.create({
        data: {
          status: BookingStatus.APPROVED,
          startAt: new Date("2025-07-15T10:00:00.000Z"),
          endAt: new Date("2025-07-15T18:00:00.000Z"),
          customerName: "Demo Kunde",
          customerEmail: "demo@example.com",
          customerPhone: "+49 123 456789",
          deliveryType: DeliveryType.DELIVERY,
          deliveryAddress: "Musterstraße 1, 12345 Musterstadt",
          notes: "Bitte Aufbau um 09:00 Uhr",
          bookingItems: {
            create: [{ itemId: huepfburgClassic.id, quantity: 1 }],
          },
        },
      });
    }
  }

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
