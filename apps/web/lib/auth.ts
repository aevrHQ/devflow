import * as jwt from "jsonwebtoken";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import { cookies } from "next/headers";

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;

if (!ACCESS_SECRET) {
  console.error("❌ CRITICAL: ACCESS_TOKEN_SECRET environment variable not set!");
  console.error("   Set it in .env.local or your deployment platform");
  console.error("   Generate a strong secret: openssl rand -hex 32");
  process.exit(1);
}

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "3h";

export interface UserPayload extends JwtPayload {
  userId: string;
  email: string;
}

/**
 * Sign a JWT token with user payload
 * @param payload - User ID and email
 * @param expiresIn - Token expiration (default: from ACCESS_TOKEN_EXPIRY env var)
 */
export function signToken(
  payload: Omit<UserPayload, "iat" | "exp">,
  expiresIn?: string,
) {
  if (!ACCESS_SECRET) throw new Error("ACCESS_TOKEN_SECRET is missing");
  const options: SignOptions = {
    expiresIn: (expiresIn || ACCESS_TOKEN_EXPIRY) as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, ACCESS_SECRET, options);
}

/**
 * Verify and decode a JWT token
 * @param token - The JWT token string
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): UserPayload | null {
  if (!ACCESS_SECRET) return null;
  try {
    return jwt.verify(token, ACCESS_SECRET) as UserPayload;
  } catch (e) {
    return null;
  }
}

/**
 * Get current authenticated user from cookies (server-side)
 * @returns User payload or null if not authenticated
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  return verifyToken(token);
}

/**
 * Set the authentication cookie
 */
export async function setAuthCookie(token: string, maxAge: number) {
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAge, // seconds
  });
}

/**
 * Clear the authentication cookie
 */
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
}
