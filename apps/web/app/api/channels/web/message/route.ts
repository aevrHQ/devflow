import { NextRequest, NextResponse } from "next/server";
import { webChannel } from "@/lib/channels/web";

export async function POST(request: NextRequest) {
  try {
    await webChannel.processEvent(request);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Web Channel Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
