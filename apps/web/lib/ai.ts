import { createProvider } from "@untools/ai-toolkit";

if (!process.env.GROQ_API_KEY) {
  // Warn instead of throw to allow BYOK to work without env var (though unlikely in current setup)
  console.warn("GROQ_API_KEY is not defined in environment variables");
}

export const aiProvider = createProvider({
  provider: "vercel",
  vercelModel: { type: "groq", model: "llama-3.1-8b-instant" },
  apiKey: process.env.GROQ_API_KEY || "dummy", // Fallback to avoid crash on import, will fail if used
});

/**
 * Execute an AI operation with key rotation.
 * Retries the operation with the next key if the previous fails with a retryable error.
 *
 * @param keys Array of API keys to try
 * @param operation Callback that takes a key and returns a Promise
 */
export async function withRotationalKey<T>(
  keys: string[],
  operation: (key: string) => Promise<T>,
): Promise<T> {
  let lastError: unknown;

  // Ensure we have at least the env key if no user keys provided
  const allKeys =
    keys.length > 0
      ? keys
      : ([process.env.GROQ_API_KEY].filter(Boolean) as string[]);

  if (allKeys.length === 0) {
    throw new Error("No API keys available for AI operation");
  }

  for (const key of allKeys) {
    try {
      return await operation(key);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const status =
        error && typeof error === "object" && "status" in error
          ? (error as { status: number }).status
          : undefined;

      console.warn(
        `[AI Rotation] Operation failed with key ${key.substring(0, 4)}...`,
        errorMessage,
      );
      lastError = error;

      // Continue to next key key if error is 429 (Rate Limit) or 5xx (Server Error)
      // If 401 (Auth), also maybe try next?
      // For now, let's retry on almost everything except explicit "Content Policy" blocks if we can detect them.
      // But typically rotation is for Rate Limits.
      if (status === 429 || (status && status >= 500)) {
        continue;
      }

      // If it's not a retryable error (e.g. invalid request), throw immediately?
      // Safest for "rotation" is to try the next key if this one failed, assuming the key might be bad (401) or exhausted (429).
    }
  }

  throw lastError || new Error("All API keys failed");
}
