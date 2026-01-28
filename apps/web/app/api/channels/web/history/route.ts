import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import User from "@/models/User";
import connectToDatabase from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(session.userId).select("chatHistory");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ history: user.chatHistory || [] });
  } catch (error) {
    console.error("History Fetch Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 },
    );
  }
}
