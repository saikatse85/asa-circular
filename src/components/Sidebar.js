"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronRight, ChevronDown, FileText, FolderOpen, Folder } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function SidebarItem({ item, depth = 0 }) {
  const [isOpen, setIsOpen] = useState(depth === 0);
  const pathname = usePathname();

  const isLink = !!item.href;
  const isActive = isLink && pathname === item.href;
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className="w-full">
      {isLink ? (
        <Link
          href={item.href}
          className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-colors ${
            isActive 
              ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium" 
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
          style={{ paddingLeft: `${depth * 1 + 0.75}rem` }}
        >
          <FileText size={16} className={isActive ? "text-blue-500" : "text-slate-400"} />
          <span className="truncate text-sm">{item.name}</span>
        </Link>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between py-2 px-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          style={{ paddingLeft: `${depth * 1 + 0.75}rem` }}
        >
          <div className="flex items-center gap-2">
            {isOpen ? <FolderOpen size={16} className="text-indigo-400" /> : <Folder size={16} className="text-slate-400" />}
            <span className="font-medium text-sm truncate">{item.name}</span>
          </div>
          {isOpen ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
        </button>
      )}

      <AnimatePresence>
        {isOpen && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {item.children.map((child, idx) => (
              <SidebarItem key={`${child.name}-${idx}`} item={child} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Sidebar({ circulars }) {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  const hierarchy = useMemo(() => {
    let filteredCirculars = circulars;
    if (searchQuery) {
      filteredCirculars = circulars.filter(c => c.circularNo.toLowerCase().includes(searchQuery));
    }

    if (categoryFilter) {
      // Group by Category -> Topic -> Circular
      const grouped = {};
      filteredCirculars.forEach((c) => {
        if (c.topics && c.topics.length > 0) {
          c.topics.forEach((topic, idx) => {
            if (!topic) return;
            const topicCategory = c.categories?.[idx] || "Uncategorized";
            
            if (topicCategory !== categoryFilter && categoryFilter) return;

            if (!grouped[topicCategory]) grouped[topicCategory] = {};
            if (!grouped[topicCategory][topic]) grouped[topicCategory][topic] = [];
            
            grouped[topicCategory][topic].push({
              name: c.circularNo,
              href: `/circulars/${encodeURIComponent(c.circularNo)}?topic=${encodeURIComponent(topic)}`,
            });
          });
        }
      });

      return Object.entries(grouped).map(([catName, topics]) => ({
        name: catName,
        children: Object.entries(topics).map(([topicName, items]) => ({
          name: topicName,
          children: items,
        })),
      }));
    } else {
      // Group by Year -> Circular
      const grouped = {};
      filteredCirculars.forEach((c) => {
        const year = c.year || new Date(c.date).getFullYear().toString();
        if (!grouped[year]) grouped[year] = [];
        grouped[year].push({
          name: c.circularNo,
          href: `/circulars/${encodeURIComponent(c.circularNo)}`,
        });
      });

      return Object.entries(grouped)
        .sort((a, b) => b[0].localeCompare(a[0])) // Sort years descending
        .map(([year, items]) => ({
          name: year,
          children: items,
        }));
    }
  }, [circulars, categoryFilter, searchQuery]);

  return (
    <div className="w-64 flex-shrink-0 h-[calc(100vh-4rem)] border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-y-auto hidden md:block">
      <div className="p-4">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          {categoryFilter ? `${categoryFilter} Categories` : "All Circulars by Year"}
        </h2>
        <div className="space-y-1">
          {hierarchy.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No circulars found</p>
          ) : (
            hierarchy.map((item, idx) => (
              <SidebarItem key={`${item.name}-${idx}`} item={item} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
