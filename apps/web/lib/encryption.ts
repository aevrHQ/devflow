import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // For GCM, 12 bytes is standard
const AUTH_TAG_LENGTH = 16;

function getKeys(): Buffer[] {
  const secrets: string[] = [];
  if (process.env.PAYLOAD_ENCRYPTION_KEY)
    secrets.push(process.env.PAYLOAD_ENCRYPTION_KEY);
  if (process.env.CREDENTIAL_ENCRYPTION_KEY)
    secrets.push(process.env.CREDENTIAL_ENCRYPTION_KEY);

  if (secrets.length === 0) {
    throw new Error(
      "PAYLOAD_ENCRYPTION_KEY or CREDENTIAL_ENCRYPTION_KEY must be defined",
    );
  }

  return secrets.map((secret) => {
    if (secret.length === 64) return Buffer.from(secret, "hex");
    return crypto.createHash("sha256").update(secret).digest();
  });
}

/**
 * Encrypts a text string using AES-256-GCM.
 * Returns format: iv:authTag:encryptedText (all hex)
 */
export function encrypt(text: string): string {
  const keys = getKeys();
  const key = keys[0]; // Always use the first key (PAYLOAD preferred)
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts a text string using AES-256-GCM.
 * Input format: iv:authTag:encryptedText (all hex)
 */
export function decrypt(text: string): string {
  // If text doesn't look like our encrypted format, perform a "dual-read" check.
  // It might be legacy plain text (JSON usually starts with { or [).
  if (
    !text.includes(":") ||
    text.trim().startsWith("{") ||
    text.trim().startsWith("[")
  ) {
    // Attempt to parse as JSON to confirm it's legacy data, or just return it.
    return text;
  }

  const parts = text.split(":");
  if (parts.length !== 3) {
    // Fallback: treat as plain text if it doesn't match format
    return text;
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const keys = getKeys();
  let lastError: unknown;

  // Try each key until one works
  for (const key of keys) {
    try {
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedHex, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      lastError = error;
      // Continue to next key
    }
  }

  // If we get here, all keys failed
  throw lastError || new Error("Decryption failed with all available keys");
}

/**
 * Helper to encrypt a JSON object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function encryptJSON(data: any): string {
  return encrypt(JSON.stringify(data));
}

/**
 * Helper to decrypt to a JSON object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function decryptJSON<T = any>(text: string): T {
  const decrypted = decrypt(text);
  try {
    return JSON.parse(decrypted);
  } catch (e) {
    // eslint-disable-line @typescript-eslint/no-unused-vars
    // If parsing fails, it might have been a plain string or something went wrong.
    // Return original string or handle error.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return decrypted as any;
  }
}
