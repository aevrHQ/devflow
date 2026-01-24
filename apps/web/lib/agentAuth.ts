import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("❌ CRITICAL: JWT_SECRET environment variable is not set!");
  console.error("   Set it in .env.local or your deployment platform");
  console.error("   Generate a strong secret: openssl rand -hex 32");
  process.exit(1);
}

const JWT_EXPIRY: string = process.env.JWT_EXPIRY || "30d"; // 30 days

export interface AgentTokenPayload {
  agentId: string;
  userId: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate a JWT token for an agent
 */
export function generateAgentToken(
  agentId: string,
  userId: string,
): { token: string; expiresAt: Date } {
  // JWT_SECRET is guaranteed to exist due to process.exit(1) above
  const token = jwt.sign(
    { agentId, userId },
    JWT_SECRET as string,
    { expiresIn: JWT_EXPIRY } as jwt.SignOptions,
  );

  // Calculate expiration date
  const decoded = jwt.decode(token) as jwt.JwtPayload;
  const expiresAt = new Date(decoded?.exp || 0 * 1000);

  return { token, expiresAt };
}

/**
 * Verify and decode a JWT token
 */
export function verifyAgentToken(token: string): AgentTokenPayload | null {
  try {
    // JWT_SECRET is guaranteed to exist due to process.exit(1) above
    const payload = jwt.verify(
      token,
      JWT_SECRET as string,
    ) as AgentTokenPayload;
    return payload;
  } catch (error) {
    console.error("❌ CRITICAL: JWT verification failed!", error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader?: string): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  return parts[1];
}
