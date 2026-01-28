import { NextRequest, NextResponse } from "next/server";
import { SlackChannelHandler } from "@/lib/channels/slack";

export async function POST(request: NextRequest) {
  const handler = new SlackChannelHandler();

  try {
    // 1. Handle URL Verification (Challenge)
    // We clone to not consume the body for the handler later
    const clone = request.clone();
    const bodyText = await clone.text();
    const eventData = JSON.parse(bodyText);

    if (eventData.type === "url_verification") {
      return NextResponse.json({ challenge: eventData.challenge });
    }

    // 2. Process Event via standardized handler
    // processEvent handles signature validation (ensure validateRequest clones internally)
    await handler.processEvent(request);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Slack Webhook] Error:", error);
    // If invalid signature, processEvent throws error
    if (
      error instanceof Error &&
      error.message.includes("Invalid request signature")
    ) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
