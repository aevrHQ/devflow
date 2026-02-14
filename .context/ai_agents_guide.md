# AI Agents Guide: Vercel AI SDK & Groq

This guide provides a comprehensive walkthrough for implementing AI agents using the Vercel AI SDK (`ai`) and Groq (`@ai-sdk/groq`) in the `apps/web` application. It covers environment setup, agent creation, tool definition, and patterns for creating reusable, context-aware agents.

## Table of Contents

1. [Overview & Architecture](#1-overview--architecture)
2. [Prerequisites & Environment Setup](#2-prerequisites--environment-setup)
3. [Core Utilities](#3-core-utilities)
4. [Agent Implementation](#4-agent-implementation)
5. [Defining Tools](#5-defining-tools)
6. [Reusable Agent Patterns](#6-reusable-agent-patterns)
7. [Example: Minimal Agent](#7-example-minimal-agent)

---

## 1. Overview & Architecture

We use the **Vercel AI SDK** (`ai`) as our primary framework for building AI agents, coupled with **Groq** for high-speed inference (Llama 3 models).

### Key Concepts

- **Stateless Agents**: Our agents (`ToolLoopAgent`) are designed to be stateless or manage short-lived conversational history within a single request/response cycle where possible.
- **Tool Calling**: Agents interact with the application (DB, APIs) _exclusively_ through strictly typed tools (`zod` schemas).
- **Key Rotation**: To handle API rate limits and allow "Bring Your Own Key" (BYOK) functionality, we use a key rotation utility (`withRotationalKey`).
- **Context injection**: User ID and source context are injected into tool factories at runtime, ensuring security and proper data access.

---

## 2. Prerequisites & Environment Setup

### Type Definitions & Packages

Ensure the following packages are installed in `apps/web/package.json`:

```bash
npm install ai @ai-sdk/groq zod @untools/ai-toolkit
```

### Environment Variables

Configure your `.env` file with the necessary API keys:

```env
# Primary Groq API Key
GROQ_API_KEY=gsk_...
```

The system is designed to fallback to user-provided keys if `GROQ_API_KEY` is exhausted or if the user prefers their own credentials (BYOK).

---

## 3. Core Utilities

### AI Provider & Key Rotation (`lib/ai.ts`)

We use a helper to manage API key rotation. This is critical for reliability.

```typescript
import { createGroq } from "@ai-sdk/groq";

/**
 * Execute an AI operation with key rotation.
 * Retries the operation with the next key if the previous fails with a retryable error (e.g., 429).
 */
export async function withRotationalKey<T>(
  keys: string[],
  operation: (key: string) => Promise<T>,
): Promise<T> {
  // ... implementation handles retry logic for 429/5xx errors
}
```

---

## 4. Agent Implementation

Agents are typically implemented in `lib/agents/` (e.g., `lib/agents/chatAssistant.ts`).

### The `generateChatResponse` Pattern

A standard agent function follows this pattern:

1.  **Gather Keys**: Collect keys from the environment AND the user's encrypted credentials (if available).
2.  **Initialize Client**: Use `withRotationalKey` to initialize the Groq provider.
3.  **Instantiate Agent**: Create a `ToolLoopAgent` (or `generateText`/`streamText` from `ai` SDK) with the model, instructions, and tools.
4.  **Execute**: Run the generation step and process the output.

```typescript
import { ToolLoopAgent, stepCountIs } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { createDashboardTools } from "./tools";

export async function generateChatResponse(input: ChatInput) {
  // 1. Gather Keys (Pseudo-code)
  const availableKeys = [...userKeys, process.env.GROQ_API_KEY];

  // 2. Wrap in Rotation Logic
  return await withRotationalKey(availableKeys, async (apiKey) => {
    const groq = createGroq({ apiKey });

    // 3. Define Agent
    const agent = new ToolLoopAgent({
      model: groq("llama-3.3-70b-versatile"),
      instructions: "You are a helpful assistant...",
      tools: {
        // Inject context into tools
        ...createDashboardTools({ userId: input.userId }),
      },
      // Prevent infinite loops
      stopWhen: stepCountIs(10),
    });

    // 4. Run
    const result = await agent.generate({
      messages: [{ role: "user", content: input.message }],
    });

    return { text: result.text };
  });
}
```

---

## 5. Defining Tools

Tools are defined using `tool()` from the `ai` SDK and `zod` for schema validation. We typically separate tool definitions into `tools.ts` to keep the agent logic clean.

### Structure of a Tool

```typescript
import { tool } from "ai";
import { z } from "zod";

export const getSystemTime = tool({
  description: "Get the current server time",
  // Always provide a schema, even if empty, for LLM understanding
  inputSchema: z.object({}),
  execute: async () => new Date().toLocaleString(),
});
```

### Accessing Database Models

Tools can import and use Mongoose models directly. Ensure you connect to the database first.

```typescript
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export const getUserProfile = tool({
  description: "Get user profile details",
  inputSchema: z.object({ userId: z.string() }),
  execute: async ({ userId }) => {
    await connectToDatabase();
    return await User.findById(userId);
  },
});
```

---

## 6. Reusable Agent Patterns

To make agents reusable and secure, we use **Tool Factories**. Instead of exporting static tool objects, export a function that returns the tool definitions, allowing you to inject runtime context (like `userId`).

### The Tool Factory Pattern

**`lib/agents/tools.ts`**:

```typescript
export const createDashboardTools = (context: { userId?: string }) => {
  return {
    getStats: tool({
      description: "Get user stats",
      inputSchema: z.object({}),
      execute: async () => {
        // SECURITY: Use the injected context, not client-provided arguments
        if (!context.userId) return { error: "Unauthorized" };
        return await getUserStats(context.userId);
      },
    }),

    // ... potentially dozens of tools sharing the same context
  };
};
```

### Usage in Agent

```typescript
import { createDashboardTools } from "./tools";

// ... inside agent setup
tools: {
  // One-line injection of all dashboard capabilities for this specific user
  ...createDashboardTools({ userId: input.userId }),

  // You can mix and match factories
  // ...createGitHubTools({ token: user.githubToken }),
}
```

### Benefits

1.  **Security**: `userId` is trusted (from session/token), not HALLUCINATED by the LLM as a tool argument.
2.  **Modularity**: You can group tools by domain (Dashboard, GitHub, Stripe) and mix them into different agents.
3.  **Testability**: You can easily inject mock contexts for testing tools.

---

## 7. Example: Minimal Agent

Here is a minimal, complete example of a "Greeting Agent" that knows the user's name from the database.

**`lib/agents/greetingTools.ts`**

```typescript
import { tool } from "ai";
import { z } from "zod";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export const createGreetingTools = (context: { userId: string }) => ({
  getUserName: tool({
    description: "Get the user's name from the DB",
    inputSchema: z.object({}),
    execute: async () => {
      await connectToDatabase();
      const user = await User.findById(context.userId);
      return { name: user?.firstName || "Friend" };
    },
  }),
});
```

**`lib/agents/greetingAgent.ts`**

```typescript
import { ToolLoopAgent, stepCountIs } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { withRotationalKey } from "../ai";
import { createGreetingTools } from "./greetingTools";

export async function greetUser(userId: string) {
  return await withRotationalKey(
    [process.env.GROQ_API_KEY!],
    async (apiKey) => {
      const groq = createGroq({ apiKey });

      const agent = new ToolLoopAgent({
        model: groq("llama-3-8b-8192"),
        instructions:
          "You are a friendly greeter. Always address the user by their name if possible.",
        tools: {
          ...createGreetingTools({ userId }),
        },
        stopWhen: stepCountIs(5),
      });

      const result = await agent.generate({
        messages: [{ role: "user", content: "Hello!" }],
      });

      return result.text;
    },
  );
}
```
