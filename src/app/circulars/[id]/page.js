import clientPromise from "@/lib/mongodb";
import { notFound } from "next/navigation";
import { Calendar, Tag, Layers, FileDown } from "lucide-react";

export default async function CircularDetailsPage({ params, searchParams }) {
  const { id } = await params;
  const { topic } = await searchParams;
  const decodedId = decodeURIComponent(id);
  const selectedTopic = topic ? decodeURIComponent(topic) : null;

  const normalizeTopicLabel = (topicItem) => {
    if (topicItem == null) return "";
    if (typeof topicItem === "string") return topicItem;
    return topicItem.title || topicItem.details || JSON.stringify(topicItem);
  };

  const normalizeDetailText = (detailItem) => {
    if (detailItem == null) return "";
    if (typeof detailItem === "string") return detailItem;
    return detailItem.details || detailItem.title || JSON.stringify(detailItem);
  };

  const client = await clientPromise;
  const db = client.db("asa-circular");
  const circular = await db.collection("circulars").findOne({ circularNo: decodedId });

  if (!circular) {
    notFound();
  }

  const topicIndex = selectedTopic && circular.topics
    ? circular.topics.findIndex(t => normalizeTopicLabel(t) === selectedTopic)
    : -1;

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 p-8 bg-slate-50/50 dark:bg-slate-800/50">
        <div className="flex flex-wrap gap-3 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            <Tag size={12} />
            {circular.category}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
            <Calendar size={12} />
            {new Date(circular.date).toLocaleDateString("en-GB")}
          </span>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Circular No: {circular.circularNo}
        </h1>
      </div>

      {/* Topics */}
      <div className="p-8 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers size={16} /> Topics & Sub-menus
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {circular.topics?.map((topic, idx) => {
            if (!topic) return null;
            if (selectedTopic && topic !== selectedTopic) return null;
            return (
              <li key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {normalizeTopicLabel(topic)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Content */}
      <div className="p-8 bg-white dark:bg-slate-800">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
          {selectedTopic && topicIndex !== -1 ? `Topic Details: ${selectedTopic}` : "Full Content"}
        </h3>
        <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
          {selectedTopic && topicIndex !== -1 && circular.topicDetails && circular.topicDetails[topicIndex]
            ? normalizeDetailText(circular.topicDetails[topicIndex])
            : circular.fullContent}
        </div>
      </div>

      {/* Attachment */}
      {circular.attachmentUrl && (
        <div className="p-8 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <a
            href={circular.attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 hover:shadow-md transition-all"
          >
            <FileDown size={20} className="text-blue-500 dark:text-blue-400" />
            Download Attachment
          </a>
        </div>
      )}
    </div>
  );
}
