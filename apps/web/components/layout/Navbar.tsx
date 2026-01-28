"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          DevFlow
          <span className="ml-2 text-[10px] uppercase font-bold tracking-wider bg-black text-white px-2 py-0.5 rounded-full bg-linear-to-r from-orange-400 to-amber-400">
            Beta
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/help"
            className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
          >
            Help
          </Link>
          <Link
            href="https://github.com/miracleonyenma/devflow"
            target="_blank"
            className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
          >
            GitHub
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            Dashboard
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 -mr-2 text-gray-600 hover:text-black"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-gray-100 bg-white overflow-hidden"
          >
            <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
              <Link
                href="/help"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-medium text-gray-600 hover:text-black py-2"
              >
                Help
              </Link>
              <Link
                href="https://github.com/miracleonyenma/devflow"
                target="_blank"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-medium text-gray-600 hover:text-black py-2"
              >
                GitHub
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-medium bg-black text-white px-4 py-3 rounded-xl text-center hover:bg-gray-800 transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
