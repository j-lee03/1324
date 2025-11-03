"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "홈", href: "/" },
    { label: "질문 생성", href: "/generate" },
  ];

  return (
    <nav className="bg-white border-b shadow-sm fixed top-0 w-full z-10">
      <div className="max-w-4xl mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-semibold text-blue-700">
          🤖 AI 인터뷰
        </Link>
        <div className="flex space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`font-medium hover:text-blue-600 ${
                pathname === item.href
                  ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                  : "text-gray-700"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
