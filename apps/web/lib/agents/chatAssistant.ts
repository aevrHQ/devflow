import { ToolLoopAgent, ModelMessage, tool, stepCountIs } from "ai";
import { createDashboardTools } from "./tools";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";

interface ChatInput {
  message: string;
  senderName?: string;
  history?: ModelMessage[];
  userId?: string;
  source?: {
    channel: "telegram" | "slack" | "dashboard" | "cli" | "web";
    chatId?: string;
    messageId?: string;
  };
}

export async function generateChatResponse(
  input: ChatInput,
): Promise<{ text: string; history: ModelMessage[] } | undefined> {
  // 1. Get User Keys if userId is provided
  let userKeys: string[] = [];

  if (input.userId) {
    try {
      // We might need to fetch the user here if not passed.
      // Since this is called from API route, we can fetch user from DB.
      // Assuming we can access DB here.
      const { default: User } = await import("@/models/User");
      const { default: connectToDatabase } = await import("@/lib/mongodb");
      const { decryptCredentials } = await import("@/lib/credentialEncryption");

      await connectToDatabase();
      const user = await User.findById(input.userId);

      if (user?.credentials?.groqApiKeys?.length) {
        const decrypted = decryptCredentials(user.credentials);
        if (decrypted.groqApiKeys) {
          userKeys = decrypted.groqApiKeys;
        }
      }
    } catch (err) {
      console.error("Failed to fetch user keys", err);
    }
  }

  // 2. Combine with env key
  const envKey = process.env.GROQ_API_KEY;
  const availableKeys = [...userKeys, ...(envKey ? [envKey] : [])];

  if (availableKeys.length === 0) {
    console.error("GROQ_API_KEY not configured and no user keys found");
    return {
      text: "I'd love to chat, but my brain (API Key) is missing! 🧠❌",
      history: [],
    };
  }

  // 3. Define the operation
  const { withRotationalKey } = await import("../ai");

  try {
    return await withRotationalKey(availableKeys, async (apiKey) => {
      const groq = createGroq({
        apiKey: apiKey,
      });

      const agent = new ToolLoopAgent({
        model: groq("llama-3.3-70b-versatile"), // Use versatile model
        instructions: `You are Devflow, a friendly and enthusiastic developer companion! 🚀
        You help developers track their deployments, issues, and notifications. You also act as a ChatOps interface for their infrastructure.

        Personality:
        - Warm, helpful, and slightly witty.
        - Use emojis freely! 🎉
        - You love tech, coding, and shipping cool stuff.
        
        Capabilities:
        - WEHBOOKS: Track GitHub, Render, Vercel, Linear, and custom webhooks.
        - AGENTS (\`devflow init\`): You can control remote machines! Run scripts, check logs, and manage fleets securely via WebSocket tunnels.
        - CLI (\`npx devflow\`): Guide users to install the CLI to connect their localhost or servers.
        - BYOK: Users can add their own Groq API keys in Settings > Credentials to avoid rate limits.

        If asked about "Agents":
        - Explain that agents allow you to run commands on their machine securely.
        - Tell them to run \`npx devflow login\` then \`npx devflow init\` on their server/laptop.

        If asked for help: Direct them to the dashboard or "/help" command.
        Keep responses concise within telegram limits.
        
        Talking to: ${input.senderName || "Friend"}`,
        tools: {
          ...createDashboardTools({
            userId: input.userId,
            source: input.source,
          }),
          get_current_time: tool({
            description: "Get the current server time",
            inputSchema: z.object({}),
            execute: async () => new Date().toLocaleString(),
          }),
        },
        stopWhen: stepCountIs(10),
      });

      const result = await agent.generate({
        messages: [
          ...(input.history || []),
          { role: "user", content: input.message },
        ],
      });

      console.log("[ChatAssistant] Agent Result:", {
        text: result.text,
        stepsLen: result.steps?.length,
        steps: JSON.stringify(result.steps, null, 2),
      });

      // Clean up any potential hallucinated tool tags from the text
      const cleanText = result.text
        .replace(/<function=.*?><\/function>/g, "")
        .trim();

      return {
        text: cleanText,
        history: [], // Still empty as per MVP plan
      };
    });
  } catch (error) {
    console.error("Failed to generate chat response (all keys failed):", error);
    return {
      text: "Oops! I tripped over a wire and couldn't think of a response. 🔌💥",
      history: [],
    };
  }
}
