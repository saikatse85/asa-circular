import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession();
    // if (!session || session.user.role !== "admin") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const data = await req.json();

    const client = await clientPromise;
    const db = client.db("asa-circular");

    const result = await db.collection("notices").updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );

    if (result.matchedCount === 0) return NextResponse.json({ message: "Notice not found" }, { status: 404 });
    return NextResponse.json({ message: "Notice updated" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession();
    // if (!session || session.user.role !== "admin") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("asa-circular");

    const result = await db.collection("notices").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) return NextResponse.json({ message: "Notice not found" }, { status: 404 });
    return NextResponse.json({ message: "Notice deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
