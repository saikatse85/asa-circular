import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { employeeId, name, password } = await req.json();

    if (!employeeId || !name || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Password validation: 6-digit with at least 1 uppercase, 1 numeric, 1 special char
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[#.*&%$@!\-_]).{6,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json({
        message: "Password must be at least 6 characters, including 1 uppercase, 1 number, and 1 special character."
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("asa-circular");

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ employeeId });
    if (existingUser) {
      return NextResponse.json({ message: "Employee ID already registered" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Default role is user. Admins managed manually in DB.
    const newUser = {
      employeeId,
      name,
      password: hashedPassword,
      role: "user",
      createdAt: new Date(),
    };

    await db.collection("users").insertOne(newUser);

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
