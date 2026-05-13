"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FileText, Bell, AlertTriangle } from "lucide-react";

export default function CircularsPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search");

  const [notices, setNotices] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const getResultTitle = (result) => {
    if (typeof result.title === "string") return result.title;
    if (result.title && typeof result.title === "object") {
      return result.title.title || result.title.details || JSON.stringify(result.title);
    }
    if (result.topics) {
      return Array.isArray(result.topics)
        ? result.topics.map((topicItem) => typeof topicItem === "string" ? topicItem : topicItem.title || topicItem.details || JSON.stringify(topicItem)).join(" • ")
        : "View Circular Details";
    }
    return "View Circular Details";
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (searchQuery) {
          const res = await fetch(`/api/circulars?query=${encodeURIComponent(searchQuery)}`);
          const data = await res.json();
          setSearchResults(data);
        } else {
          const res = await fetch("/api/notices?active=true");
          const data = await res.json();
          setNotices(data);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (searchQuery) {
    return (
      <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
          Search Results for "{searchQuery}"
        </h2>
        {searchResults.length === 0 ? (
          <p className="text-slate-500">No results found.</p>
        ) : (
          <div className="space-y-4">
            {searchResults.map((result) => (
              <Link
                key={result._id}
                href={result.href || `/circulars/${encodeURIComponent(result.circularNo)}`}
                className="block bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                    {result.circularNo}
                    {result.type === "topic" && (
                      <span className="text-[10px] px-2 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                        Topic Match
                      </span>
                    )}
                  </h3>
                  <span className="text-xs font-medium px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                    {result.category}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mt-2">
                  {getResultTitle(result)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Welcome Message */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText size={32} className="text-blue-500 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          Welcome to the Dashboard
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
          Use the sidebar navigation to browse circulars by category. You can also use the global search bar to find specific content.
        </p>
      </div>

      {/* Notice Board Widget */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex-1">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/50">
          <Bell className="text-amber-500" size={24} />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Notice Board</h3>
        </div>
        
        <div className="p-6 max-h-[500px] overflow-y-auto">
          {notices.length === 0 ? (
            <p className="text-center text-slate-500 italic py-8">No active notices at this time.</p>
          ) : (
            <div className="space-y-4">
              {notices.map((notice) => (
                <div 
                  key={notice._id} 
                  className={`p-5 rounded-2xl border ${
                    notice.priority === 'High' 
                      ? 'bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30' 
                      : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-700/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                      {notice.priority === 'High' && <AlertTriangle size={18} className="text-red-500" />}
                      {notice.title}
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
                    {notice.content}
                  </p>
                  <div className="mt-4 text-xs text-slate-400 dark:text-slate-500">
                    Posted by: {notice.postedBy}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
