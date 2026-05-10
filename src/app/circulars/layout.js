import Sidebar from "@/components/Sidebar";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function CircularsLayout({ children }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/");
  }

  const client = await clientPromise;
  const db = client.db("asa-circular");
  const circulars = await db.collection("circulars").find({}).sort({ createdAt: -1 }).toArray();

  const serializedCirculars = circulars.map(c => ({
    _id: c._id.toString(),
    circularNo: c.circularNo,
    year: c.year,
    date: c.date,
    categories: c.categories || [],
    category: c.category || "",
    topics: c.topics,
  }));

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <Suspense fallback={<div className="w-64 p-4 text-slate-500">Loading sidebar...</div>}>
        <Sidebar circulars={serializedCirculars} />
      </Suspense>
      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 p-4 sm:p-8">
        {children}
      </div>
    </div>
  );
}
