"use client";

import Link from "next/link";

export default function AdminDashboard() {
  const cards = [
    {
      title: "Kategorien",
      description: "Kategorien verwalten",
      href: "/admin/categories",
      icon: "📁",
    },
    {
      title: "Items",
      description: "Artikel verwalten",
      href: "/admin/items",
      icon: "🎪",
    },
    {
      title: "Buchungen",
      description: "Buchungen ansehen (bald verfügbar)",
      href: "#",
      icon: "📅",
      disabled: true,
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className={`block p-6 bg-white rounded-lg shadow hover:shadow-lg transition ${
              card.disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={(e) => card.disabled && e.preventDefault()}
          >
            <div className="text-4xl mb-4">{card.icon}</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {card.title}
            </h2>
            <p className="text-sm text-gray-600">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
