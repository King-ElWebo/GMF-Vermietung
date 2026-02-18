"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard", icon: "🏠" },
    { href: "/admin/categories", label: "Kategorien", icon: "📁" },
    { href: "/admin/items", label: "Items", icon: "🎪" },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-8">
            <Link href="/admin" className="text-2xl font-bold hover:text-blue-100 transition">
              GMF Admin
            </Link>
            <div className="hidden md:flex space-x-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-5 py-2.5 rounded-lg text-base font-semibold transition-all duration-200 ${
                    pathname === link.href
                      ? "bg-white text-blue-700 shadow-md"
                      : "text-blue-50 hover:bg-blue-500 hover:text-white"
                  }`}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <Link
            href="/"
            className="text-base font-medium text-blue-100 hover:text-white hover:underline transition"
          >
            ← Zurück zur Website
          </Link>
        </div>
      </div>
    </nav>
  );
}
