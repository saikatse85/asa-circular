import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req, { params }) {
  try {
    // Await params if needed in Next 15, but usually ok as is in Next 14. 
    // In Next 15 params is a Promise. Let's await it to be safe for Next 15.
    const { id } = await params; 

    // Handle encoded slugs
    const decodedId = decodeURIComponent(id);

    const client = await clientPromise;
    const db = client.db("asa-circular");

    const circular = await db.collection("circulars").findOne({ circularNo: decodedId });

    if (!circular) {
      return NextResponse.json({ message: "Circular not found" }, { status: 404 });
    }

    return NextResponse.json(circular, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch circular:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const data = await req.json();

    const client = await clientPromise;
    const db = client.db("asa-circular");

    const result = await db.collection("circulars").updateOne(
      { circularNo: decodeURIComponent(id) },
      { $set: data }
    );

    if (result.matchedCount === 0) return NextResponse.json({ message: "Circular not found" }, { status: 404 });
    return NextResponse.json({ message: "Circular updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to update circular:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
