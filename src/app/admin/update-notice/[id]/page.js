"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Save, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";

export default function UpdateNoticePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const [noticeData, setNoticeData] = useState({ title: "", content: "", priority: "Normal" });

  // Fetch data
  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const res = await fetch(`/api/notices/${id}`);
        if (!res.ok) throw new Error("Failed to fetch notice");
        const data = await res.json();
        setNoticeData({
          title: data.title || "",
          content: data.content || "",
          priority: data.priority || "Normal",
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load notice data';
        console.error(err);
        Swal.fire({ title: 'Error', text: errorMessage, icon: 'error' });
      } finally {
        setFetchLoading(false);
      }
    };
    if (id) fetchNotice();
  }, [id]);

  // Redirect if not admin
  if (status === "loading") return <div className="p-8">Loading...</div>;
  if (!session || session.user.role !== "admin") {
    return (
      <div className="p-8 text-center mt-20">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Access Denied</h2>
        <p className="text-slate-500 mt-2">You must be an admin to view this page.</p>
        <button onClick={() => router.push("/")} className="mt-6 text-blue-600 hover:underline">
          Return Home
        </button>
      </div>
    );
  }

  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/notices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noticeData),
      });

      if (!res.ok) throw new Error("Failed to update notice");

      Swal.fire({ title: 'Success!', text: 'Notice updated successfully!', icon: 'success' });
      router.push("/admin");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error(err);
      Swal.fire({ title: 'Error', text: errorMessage, icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 mt-8">
        <div className="text-center">Loading notice data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 mt-8">
      <div className="mb-8 border-b border-slate-200 dark:border-slate-700 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Update Notice</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Edit the notice details.</p>
        </div>
      </div>

      <form onSubmit={handleNoticeSubmit} className="space-y-6 animate-in fade-in">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Notice Title</label>
          <input
            type="text"
            required
            placeholder="Important announcement..."
            value={noticeData.title}
            onChange={(e) => setNoticeData({ ...noticeData, title: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Notice Details</label>
          <textarea
            required
            rows={4}
            placeholder="Details about the notice..."
            value={noticeData.content}
            onChange={(e) => setNoticeData({ ...noticeData, content: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white resize-y"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Priority</label>
          <select
            value={noticeData.priority}
            onChange={(e) => setNoticeData({ ...noticeData, priority: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
          >
            <option value="Normal">Normal</option>
            <option value="High">High</option>
          </select>
        </div>
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={18} /> Update Notice
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}