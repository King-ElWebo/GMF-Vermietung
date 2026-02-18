"use client";

import Link from "next/link";

export default function AdminDashboard() {
  const cards = [
    {
      title: "Kategorien",
      description: "Kategorien erstellen und verwalten",
      href: "/admin/categories",
      icon: "📁",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Items",
      description: "Artikel und Produkte verwalten",
      href: "/admin/items",
      icon: "🎪",
      color: "from-green-500 to-green-600",
    },
    {
      title: "Buchungen",
      description: "Buchungen ansehen (bald verfügbar)",
      href: "#",
      icon: "📅",
      color: "from-gray-400 to-gray-500",
      disabled: true,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Admin Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Verwalten Sie Ihre Kategorien und Items
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className={`group relative block overflow-hidden rounded-2xl shadow-lg transition-all duration-300 ${
              card.disabled
                ? "opacity-60 cursor-not-allowed"
                : ""
            }`}
            onClick={(e) => card.disabled && e.preventDefault()}
          >
            <div className={`bg-gradient-to-br ${card.color} p-8 text-white h-full min-h-[220px] flex flex-col justify-between`}>
              <div>
                <div className="text-6xl mb-6">{card.icon}</div>
                <h2 className="text-2xl font-bold mb-3">
                  {card.title}
                </h2>
                <p className="text-white/90 text-base leading-relaxed">
                  {card.description}
                </p>
              </div>
              {!card.disabled && (
                <div className="mt-6 flex items-center text-sm font-semibold">
                  <span>Öffnen</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
