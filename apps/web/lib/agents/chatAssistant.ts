import { generateText, ModelMessage, tool } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";

interface ChatInput {
  message: string;
  senderName?: string;
  history?: ModelMessage[];
}

export async function generateChatResponse(
  input: ChatInput,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ text: string; history: any[] } | undefined> {
  if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY not configured");
    return {
      text: "I'd love to chat, but my brain (API Key) is missing! 🧠❌",
      history: [],
    };
  }

  const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    const result = await generateText({
      model: groq("llama-3.1-8b-instant"),
      system: `You are Pinga, a friendly and enthusiastic developer companion! 🚀
You help developers track their deployments, issues, and notifications.

Personality:
- Warm, helpful, and slightly witty.
- Use emojis freely! 🎉
- You love tech, coding, and shipping cool stuff.
- If asked about your capabilities: You can track GitHub, Render, Vercel, Linear, and custom webhooks.
- If asked for help: Direct them to the dashboard or "/help" command.
- Keep responses concise within telegram limits.

User Context:
- Talking to: ${input.senderName || "Friend"}

Goal:
- Reply to the user's message in character.
- Use tools if needed (e.g. asking for time or project stats).`,
      messages: [
        ...(input.history || []),
        {
          role: "user",
          content: input.message,
        },
      ],
      tools: {
        get_current_time: tool({
          description: "Get the current server time",
          parameters: z.object({}),
          execute: async () => new Date().toLocaleString(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any),
        get_project_stats: tool({
          description: "Get current project statistics (mock)",
          parameters: z.object({}),
          execute: async () => ({
            deployments: 42,
            notifications_sent: 1337,
            uptime: "99.9%",
          }),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any),
      },
      maxSteps: 5,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    console.log("[ChatAssistant] GenerateText Result:", {
      text: result.text,
      toolCallsLen: result.toolCalls?.length,
      finishReason: result.finishReason,
    });

    return {
      text: result.text,
      history: [], // Still empty for now as verified in previous plan
    };
  } catch (error) {
    console.error("Failed to generate chat response:", error);
    return {
      text: "Oops! I tripped over a wire and couldn't think of a response. 🔌💥",
      history: [],
    };
  }
}
