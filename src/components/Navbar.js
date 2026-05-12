"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon, Search, User, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const router = require("next/navigation").useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchOpen(false);
    router.push(`/circulars?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <nav className="relative z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <img src="https://i.ibb.co.com/DfGJz4xf/logo.png" alt="logo" width={40} height={40} className="rounded-lg" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                ASA Circular
              </span>
            </Link>
          </div>

          {/* Middle: Links (Desktop only) */}
          {session && (
            <div className="hidden md:block flex-1">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/circulars" className="hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium transition">Circulars</Link>
                <Link href="/circulars?category=Accounts" className="hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium transition">Accounts</Link>
                <Link href="/circulars?category=HR" className="hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium transition">HR</Link>
                <Link href="/circulars?category=Operation" className="hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium transition">Operation</Link>
                <Link href="/circulars?category=General" className="hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium transition">General</Link>
              </div>
            </div>
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            {session && (
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-500 dark:text-slate-400"
              >
                <Search size={20} />
              </button>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-500 dark:text-slate-400"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {session && (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <User size={16} />
                  </div>
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 py-1"
                    >
                      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {session.user.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          ID: {session.user.employeeId}
                        </p>
                      </div>

                      {session.user.role === "admin" && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <LayoutDashboard size={16} />
                          Admin Dashboard
                        </Link>
                      )}

                      <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            {session && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && session && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-2">
              <Link
                href="/circulars"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block hover:bg-slate-100 dark:hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition"
              >
                Circulars
              </Link>
              <Link
                href="/circulars?category=Accounts"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block hover:bg-slate-100 dark:hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition"
              >
                Accounts
              </Link>
              <Link
                href="/circulars?category=HR"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block hover:bg-slate-100 dark:hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition"
              >
                HR
              </Link>
              <Link
                href="/circulars?category=Operation"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block hover:bg-slate-100 dark:hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition"
              >
                Operation
              </Link>
              <Link
                href="/circulars?category=General"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block hover:bg-slate-100 dark:hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition"
              >
                General
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="absolute top-16 left-0 right-0 bg-white dark:bg-slate-900 shadow-xl border-b border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="max-w-3xl mx-auto p-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by Circular No, Topic, Content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 transition-shadow outline-none text-slate-900 dark:text-white"
                  autoFocus
                />
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
