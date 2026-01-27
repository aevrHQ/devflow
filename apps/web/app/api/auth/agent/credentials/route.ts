import { NextRequest, NextResponse } from "next/server";
import { verifyAgentToken, extractToken } from "@/lib/agentAuth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { decryptCredentials } from "@/lib/credentialEncryption";

/**
 * GET /api/auth/agent/credentials
 * Returns decrypted user credentials for the authenticated agent
 * This is called during `devflow init` to sync platform credentials to local config
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Extract and verify agent token
    const token = extractToken(request.headers.get("Authorization") || "");
    if (!token) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 },
      );
    }

    const payload = verifyAgentToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    // Fetch user's encrypted credentials
    const user = await User.findById(payload.userId).select("credentials");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Decrypt credentials
    let githubToken: string | undefined;
    if (user.credentials?.github) {
      try {
        const decrypted = decryptCredentials({
          github: user.credentials.github,
        });
        githubToken = decrypted.github;
      } catch (error) {
        console.error("[agent/credentials] Failed to decrypt:", error);
        return NextResponse.json(
          {
            error: "Failed to decrypt credentials",
            details: error instanceof Error ? error.message : String(error),
          },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      success: true,
      credentials: {
        github_token: githubToken,
      },
    });
  } catch (error) {
    console.error("[agent/credentials] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
