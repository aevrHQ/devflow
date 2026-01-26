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

  const derivedKeys: Buffer[] = [];

  for (const secret of secrets) {
    // 1. Hex 64 (Direct)
    if (secret.length === 64) {
      derivedKeys.push(Buffer.from(secret, "hex"));
      continue;
    }

    // 2. SHA-256 Hash (Standard Web)
    derivedKeys.push(crypto.createHash("sha256").update(secret).digest());

    // 3. Raw Buffer (Legacy Agent Host)
    // Agent host logic: Buffer.from(key.substring(0, 32)) when key is string
    if (secret.length >= 32) {
      derivedKeys.push(Buffer.from(secret.substring(0, 32)));
    }
  }

  return derivedKeys;
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

  const [ivHex, part2, part3] = parts;
  const iv = Buffer.from(ivHex, "hex");

  const keys = getKeys();
  let lastError: unknown;

  // Detect Algorithm based on IV length
  // GCM uses 12-byte IV (24 hex chars)
  // CBC uses 16-byte IV (32 hex chars)
  const isGCM = iv.length === 12;
  const isCBC = iv.length === 16;

  if (!isGCM && !isCBC) {
    // Unknown format (maybe raw string with colons? return as is)
    return text;
  }

  // Try each key until one works
  console.log(
    `[Decryption] Attempting to decrypt. Keys: ${keys.length}, IV: ${iv.length}, GCM: ${isGCM}, CBC: ${isCBC}`,
  );

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    try {
      let decrypted = "";

      if (isGCM) {
        // GCM Format: iv:authTag:encrypted
        const authTag = Buffer.from(part2, "hex");
        const encryptedHex = part3;

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        decrypted = decipher.update(encryptedHex, "hex", "utf8");
        decrypted += decipher.final("utf8");
      } else {
        // CBC Format (Legacy)
        const encryptedHex = part3 || part2;
        const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
        decrypted = decipher.update(encryptedHex, "hex", "utf8");
        decrypted += decipher.final("utf8");
      }

      console.log(`[Decryption] Success with Key Index: ${i}`);
      return decrypted;
    } catch (error) {
      const keyHash = crypto
        .createHash("sha256")
        .update(key)
        .digest("hex")
        .substring(0, 8);
      console.warn(
        `[Decryption] Failed with Key Index: ${i} (Hash: ${keyHash}) - logic: ${isGCM ? "GCM" : "CBC"} - Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      lastError = error;
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
