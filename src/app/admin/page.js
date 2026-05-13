"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Save, UploadCloud, File, AlertCircle, PlusCircle, Trash2, Edit } from "lucide-react";
import Swal from "sweetalert2";
import Link from "next/link";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const [formData, setFormData] = useState({
    circularNo: "",
    date: new Date().toISOString().split("T")[0],
    categories: ["HR"],
    topics: [""],
    topicDetails: [""],
    fullContent: "",
  });

  const [activeTab, setActiveTab] = useState("circulars");
  const [noticeData, setNoticeData] = useState({ title: "", content: "", priority: "Normal" });
  const [noticeLoading, setNoticeLoading] = useState(false);

  const [circulars, setCirculars] = useState([]);
  const [notices, setNotices] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  // Fetch lists
  useEffect(() => {
    const fetchLists = async () => {
      setListLoading(true);
      try {
        const [circRes, notRes] = await Promise.all([
          fetch("/api/circulars"),
          fetch("/api/notices")
        ]);
        const circData = await circRes.json();
        const notData = await notRes.json();
        setCirculars(circData);
        setNotices(notData);
      } catch (err) {
        console.error("Failed to fetch lists:", err);
      } finally {
        setListLoading(false);
      }
    };
    fetchLists();
  }, []);

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

  const handleCategoryChange = (index, value) => {
    const newCategories = [...formData.categories];
    newCategories[index] = value;
    setFormData({ ...formData, categories: newCategories });
  };

  const handleTopicChange = (index, value) => {
    const newTopics = [...formData.topics];
    newTopics[index] = value;
    setFormData({ ...formData, topics: newTopics });
  };

  const handleDetailsChange = (index, value) => {
    const newDetails = [...formData.topicDetails];
    newDetails[index] = value;
    setFormData({ ...formData, topicDetails: newDetails });
  };

  const handleAddTopic = (index) => {
    const newCategories = [...formData.categories];
    const newTopics = [...formData.topics];
    const newDetails = [...formData.topicDetails];

    newCategories.splice(index + 1, 0, "HR");
    newTopics.splice(index + 1, 0, "");
    newDetails.splice(index + 1, 0, "");

    setFormData({ ...formData, categories: newCategories, topics: newTopics, topicDetails: newDetails });
  };

  const handleRemoveTopic = (index) => {
    if (formData.topics.length === 1) return; // Keep at least one
    const newCategories = [...formData.categories];
    const newTopics = [...formData.topics];
    const newDetails = [...formData.topicDetails];

    newCategories.splice(index, 1);
    newTopics.splice(index, 1);
    newDetails.splice(index, 1);

    setFormData({ ...formData, categories: newCategories, topics: newTopics, topicDetails: newDetails });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let attachmentUrl = "";

      if (file) {
        const fileData = new FormData();
        fileData.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: fileData,
        });

        if (!uploadRes.ok) throw new Error("File upload failed");

        const uploadResult = await uploadRes.json();
        attachmentUrl = uploadResult.url;
      }

      const res = await fetch("/api/circulars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          attachmentUrl,
        }),
      });

      if (!res.ok) throw new Error("Failed to save circular");

      Swal.fire({ title: 'Success!', text: 'Circular saved successfully!', icon: 'success' });
      setFormData({
        circularNo: "",
        date: new Date().toISOString().split("T")[0],
        categories: ["HR"],
        topics: [""],
        topicDetails: [""],
        fullContent: "",
      });
      setFile(null);
    } catch (err) {
      console.error(err);
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    setNoticeLoading(true);

    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noticeData),
      });

      if (!res.ok) throw new Error("Failed to post notice");

      Swal.fire({ title: 'Success!', text: 'Notice posted successfully!', icon: 'success' });
      setNoticeData({ title: "", content: "", priority: "Normal" });
    } catch (err) {
      console.error(err);
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    } finally {
      setNoticeLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
      <div className="mb-8 border-b border-slate-200 dark:border-slate-700 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Manage circulars and system notices.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("add-circulars")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === "add-circulars" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
          >
            Add Circular
          </button>
          <button
            onClick={() => setActiveTab("manage-circulars")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === "manage-circulars" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
          >
            Manage Circulars
          </button>
          <button
            onClick={() => setActiveTab("add-notices")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === "add-notices" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
          >
            Add Notice
          </button>
          <button
            onClick={() => setActiveTab("manage-notices")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === "manage-notices" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
          >
            Manage Notices
          </button>
        </div>
      </div>

      {activeTab === "add-circulars" && (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in">
          {/* Row 1: No, Category, Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Circular No
              </label>
              <input
                type="text"
                required
                placeholder="e.g. সিএ-০০১/২০২৬"
                value={formData.circularNo}
                onChange={(e) => setFormData({ ...formData, circularNo: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* 4 Topics and Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
              Topics & Sub-menus
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.topics.map((topic, i) => (
                <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase">
                      Topic {i + 1}
                    </label>
                    {formData.topics.length > 1 && (
                      <button type="button" onClick={() => handleRemoveTopic(i)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.categories[i]}
                      onChange={(e) => handleCategoryChange(i, e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                    >
                      <option value="HR">HR</option>
                      <option value="Operation">Operation</option>
                      <option value="Accounts">Accounts</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Topic / Sub-menu title"
                    value={formData.topics[i]}
                    onChange={(e) => handleTopicChange(i, e.target.value)}
                    className="w-full px-4 py-2 mb-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-900 dark:text-white"
                  />
                  <textarea
                    placeholder="Details for this topic..."
                    value={formData.topicDetails[i]}
                    onChange={(e) => handleDetailsChange(i, e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 mb-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-900 dark:text-white resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTopic(i)}
                    className="flex items-center gap-2 mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    <PlusCircle size={16} /> Add another topic below
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Full Content */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Full Circular Content
            </label>
            <textarea
              required
              rows={8}
              placeholder="Enter the full text of the circular here..."
              value={formData.fullContent}
              onChange={(e) => setFormData({ ...formData, fullContent: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white resize-y"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Attachment (PDF/Word)
            </label>
            <div className="relative flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 mb-3 text-slate-400" />
                  <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
            {file && (
              <div className="mt-3 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <File size={16} />
                <span className="truncate max-w-[200px]">{file.name}</span>
                <button type="button" onClick={() => setFile(null)} className="ml-auto text-red-500 hover:text-red-700">
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={18} /> Publish Circular
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {activeTab === "manage-circulars" && (
        <div className="space-y-6 animate-in fade-in">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Manage Circulars</h3>
          {listLoading ? (
            <div className="text-center">Loading...</div>
          ) : circulars.length === 0 ? (
            <div className="text-center text-slate-500">No circulars found.</div>
          ) : (
            <div className="space-y-4">
              {circulars.map((circular) => (
                <div key={circular._id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{circular.circularNo}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{circular.date}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{circular.topics?.[0] || "No topics"}</p>
                    </div>
                    <Link
                      href={`/admin/update-circular/${encodeURIComponent(circular.circularNo)}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <Edit size={16} /> Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "add-notices" && (
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
              disabled={noticeLoading}
              className="px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {noticeLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={18} /> Post Notice
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {activeTab === "manage-notices" && (
        <div className="space-y-6 animate-in fade-in">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Manage Notices</h3>
          {listLoading ? (
            <div className="text-center">Loading...</div>
          ) : notices.length === 0 ? (
            <div className="text-center text-slate-500">No notices found.</div>
          ) : (
            <div className="space-y-4">
              {notices.map((notice) => (
                <div key={notice._id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{notice.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{notice.priority} Priority</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{notice.content.substring(0, 100)}...</p>
                    </div>
                    <Link
                      href={`/admin/update-notice/${notice._id}`}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <Edit size={16} /> Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
