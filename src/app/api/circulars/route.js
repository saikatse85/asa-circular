import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const category = searchParams.get("category");

    const client = await clientPromise;
    const db = client.db("asa-circular");

    if (query) {
      const regex = new RegExp(query, "i");
      const filter = {
        $or: [
          { circularNo: regex },
          { categories: regex },
          { topics: regex },
          { fullContent: regex }
        ]
      };
      const circulars = await db.collection("circulars").find(filter).sort({ createdAt: -1 }).toArray();

      let results = [];
      circulars.forEach(c => {
        let topicMatched = false;
        
        // Find specific topics that match
        if (c.topics && Array.isArray(c.topics)) {
          c.topics.forEach((t, i) => {
            if (t && regex.test(t)) {
              topicMatched = true;
              results.push({
                _id: `${c._id}-topic-${i}`,
                circularNo: c.circularNo,
                category: c.categories?.[i] || c.category || "General",
                title: t,
                type: 'topic',
                href: `/circulars/${encodeURIComponent(c.circularNo)}?topic=${encodeURIComponent(t)}`
              });
            }
          });
        }
        
        // If no specific topic matched, or if circularNo/fullContent matched, return the circular itself
        if (!topicMatched || regex.test(c.circularNo) || regex.test(c.fullContent)) {
          results.push({
            _id: c._id.toString(),
            circularNo: c.circularNo,
            category: c.category || (c.categories && c.categories[0]) || "General",
            title: "Full Circular",
            type: 'circular',
            href: `/circulars/${encodeURIComponent(c.circularNo)}`
          });
        }
      });
      
      // Deduplicate if needed and limit
      const uniqueResults = Array.from(new Map(results.map(item => [item.href, item])).values()).slice(0, 20);
      return NextResponse.json(uniqueResults, { status: 200 });

    } else if (category) {
      const filter = { categories: category };
      const circulars = await db.collection("circulars").find(filter).sort({ createdAt: -1 }).toArray();
      return NextResponse.json(circulars, { status: 200 });
    }

    const circulars = await db.collection("circulars").find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(circulars, { status: 200 });

  } catch (error) {
    console.error("Failed to fetch circulars:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();

    const client = await clientPromise;
    const db = client.db("asa-circular");

    // Optional: check role here using next-auth session in a real app,
    // For this demonstration, we'll assume the client ensures only admin posts.
    
    data.createdAt = new Date();
    data.year = new Date(data.date).getFullYear().toString();

    await db.collection("circulars").insertOne(data);

    return NextResponse.json({ message: "Circular created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Failed to create circular:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
