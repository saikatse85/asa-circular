import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const active = searchParams.get("active");

    const client = await clientPromise;
    const db = client.db("asa-circular");

    let filter = {};
    if (active === "true") filter.isActive = true;

    const notices = await db.collection("notices").find(filter).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(notices, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch notices:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession();
    // Enable this check for production:
    // if (!session || session.user.role !== "admin") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const client = await clientPromise;
    const db = client.db("asa-circular");

    const newNotice = {
      ...data,
      postedBy: session?.user?.name || "Admin",
      createdAt: new Date(),
      isActive: data.isActive !== undefined ? data.isActive : true,
    };

    await db.collection("notices").insertOne(newNotice);
    return NextResponse.json({ message: "Notice created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Failed to create notice:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
