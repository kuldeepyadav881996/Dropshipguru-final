"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

const LINKS = [
  "Products",
  "Why Us",
  "Categories",
  "Roadmap",
  "Plans",
  "Courses",
  "Reviews",
  "FAQ",
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-40 bg-bg-dark/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple to-gold text-sm font-bold text-white">
            DG
          </div>
          <span className="text-lg font-bold">
            <span className="text-white">Dropship</span>
            <span className="text-gold">Guru</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 xl:flex">
          {LINKS.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm font-medium text-white transition-colors hover:text-gold"
            >
              {link}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#get-started"
            className="hidden rounded-full gold-gradient px-5 py-2.5 text-sm font-bold text-black transition-transform hover:scale-105 sm:inline-block"
          >
            Get Started
          </a>
          <button
            type="button"
            className="rounded-lg p-2 text-white xl:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-white/5 px-4 py-4 xl:hidden">
          <div className="flex flex-col gap-3">
            {LINKS.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm font-medium text-white hover:text-gold"
                onClick={() => setOpen(false)}
              >
                {link}
              </a>
            ))}
            <a
              href="#get-started"
              className="mt-2 inline-block rounded-full gold-gradient px-5 py-2.5 text-center text-sm font-bold text-black"
            >
              Get Started
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
