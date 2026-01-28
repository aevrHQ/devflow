import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, verifyToken } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User, { UserDocument } from "@/models/User";

export const runtime = "nodejs"; // Change streams require Node.js runtime, not Edge

export async function GET(req: NextRequest) {
  try {
    // 1. Authentication
    let userId = "";

    // Try Header first
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (token) {
      const payload = verifyToken(token);
      if (payload) userId = payload.userId;
    }

    // Try Cookie
    if (!userId) {
      const session = await getCurrentUser();
      if (session) userId = session.userId;
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // 2. Setup Stream
    const encoder = new TextEncoder();

    // Create a TransformStream to handle flow
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // 3. Setup MongoDB Watcher
    // We watch for updates on this specific user's document
    // specifically looking for changes to 'chatHistory'
    const pipeline = [
      {
        $match: {
          "documentKey._id": new (await import("mongoose")).Types.ObjectId(
            userId,
          ),
          // We are interested in updates where chatHistory is modified
          $or: [
            { operationType: "update" },
            { operationType: "replace" },
            { operationType: "insert" },
          ],
        },
      },
    ];

    const changeStream = User.watch(pipeline, { fullDocument: "updateLookup" });

    // Function to close everything
    const closeStream = async () => {
      try {
        await changeStream.close();
        await writer.close();
      } catch {
        // Ignore errors during close
      }
    };

    // 4. Handle connection abort
    req.signal.addEventListener("abort", () => {
      closeStream();
    });

    // 5. Start pushing data
    (async () => {
      try {
        // Initial connection message
        await writer.write(
          encoder.encode(`event: connected\ndata: "connected"\n\n`),
        );

        // Ping interval to keep connection alive (Vercel has timeouts)
        const pingInterval = setInterval(async () => {
          try {
            await writer.write(encoder.encode(`: ping\n\n`));
          } catch {
            clearInterval(pingInterval);
            closeStream();
          }
        }, 15000);

        // Listen for changes
        changeStream.on("change", async (change) => {
          if (
            change.operationType === "update" ||
            change.operationType === "replace"
          ) {
            const fullDoc = change.fullDocument as UserDocument;
            if (
              fullDoc &&
              fullDoc.chatHistory &&
              fullDoc.chatHistory.length > 0
            ) {
              // Get the last message (simplest approach for now)
              // A more robust approach would be to diff, but for "latest message" this works for now
              // or we can send the whole history diff.
              // For efficiency let's send the latest message if it looks new.

              // Actually, for consistency with the polling model which replaces the whole list or appends,
              // let's send the NEW messages.

              // HOWEVER, Change Streams `updateDescription` gives us `updatedFields`.
              // If we push, it might look like `chatHistory.50`.

              // Strategy: Since we want to ensure consistency, let's just send the specific new message
              // IF we can identify it. If not, we might trigger a "refetch" event or send the latest.

              // Valid Strategy: Send the latest message and let client append if ID distinct.
              const lastMsg =
                fullDoc.chatHistory[fullDoc.chatHistory.length - 1];

              const eventData = JSON.stringify({
                type: "message",
                message: lastMsg,
              });

              await writer.write(encoder.encode(`data: ${eventData}\n\n`));
            }
          }
        });

        // Loop until closed (which happens via error or abort)
        // The changeStream.on listener is async, so we need to keep this scope alive?
        // Actually Promise logic in Next.js Streaming is a bit tricky.
        // We generally need to wait here or let the stream controller handle it.
        // With `writer`, we are manually writing.

        // Wait for error or close
        changeStream.on("error", (err) => {
          console.error("ChangeStream error", err);
          closeStream();
        });
      } catch (e) {
        console.error("Streaming error", e);
        closeStream();
      }
    })();

    return new NextResponse(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("SSE Setup Error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
