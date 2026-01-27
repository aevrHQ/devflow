import { CopilotClient, defineTool } from "@github/copilot-sdk";
import { z } from "zod";
import * as fs from "fs/promises";
import * as path from "path";

async function main() {
  const token = process.env.GITHUB_TOKEN;
  console.log(`Token present: ${!!token}, Length: ${token?.length}`);

  // Setup client
  const client = new CopilotClient({
    logLevel: "debug",
    env: {
      ...process.env,
      GITHUB_TOKEN: token,
      GH_TOKEN: token,
      COPILOT_GITHUB_TOKEN: token,
    },
  });

  try {
    console.log("Starting Copilot Client...");
    await client.start();

    // Define the edit file tool
    const editFileTool = defineTool("edit_file", {
      description:
        "Writes content to a file. Use this to create or update files.",
      parameters: z.object({
        filePath: z.string().describe("The path of the file to write to"),
        content: z.string().describe("The content to write to the file"),
      }),
      handler: async ({
        filePath,
        content,
      }: {
        filePath: string;
        content: string;
      }) => {
        try {
          const resolvedPath = path.resolve(process.cwd(), filePath);
          await fs.writeFile(resolvedPath, content, "utf-8");
          console.log(`\n[Tool] Successfully wrote to ${resolvedPath}`);
          return { success: true, message: `File written to ${filePath}` };
        } catch (error: any) {
          console.error(`\n[Tool] Failed to write file: ${error.message}`);
          return { success: false, error: error.message };
        }
      },
    });

    console.log("Pinging server...");
    const ping = await client.ping();
    console.log(`Ping success: ${JSON.stringify(ping)}`);

    console.log("Checking Auth Status...");
    try {
      const authStatus = await client.getAuthStatus();
      console.log(`Auth Status: ${JSON.stringify(authStatus, null, 2)}`);
    } catch (e: any) {
      console.error(`Auth Status check failed: ${e.message}`);
    }

    console.log("Listing Models...");
    try {
      const models = await client.listModels();
      console.log(`Available Models: ${models.map((m) => m.id).join(", ")}`);
    } catch (e: any) {
      console.error(`List Models failed: ${e.message}`);
    }

    console.log("Creating session...");
    // Using gpt-4 or similar model. The documentation mentions "gpt-5" but that might be internal preview.
    // I'll try "gpt-4" which is safer, or check if docs suggest a default.
    // Docs use "gpt-5" in examples. I will use "gpt-4o" as it's common now, or "gpt-4".
    // Let's try "gpt-4o".
    const session = await client.createSession({
      model: "gpt-5-mini", // "gpt-4" or "gpt-5"
      // tools: [editFileTool],
      streaming: true,
    });

    console.log(`Session created (${session.sessionId}). Sending prompt...`);

    // We want to demonstrate a file edit.
    // const prompt =
    //   "Please create a file named 'copilot-demo-output.txt' with the content: 'This file was created/edited by GitHub Copilot SDK using a custom tool.'";
    const prompt = "What is 2 + 2?";

    console.log(`Sending prompt: "${prompt}"...`);

    // Handle events to print progress
    session.on((event) => {
      console.log(`[Event]: ${event.type}. Event: ${JSON.stringify(event)}`);
      if (event.type === "assistant.message") {
        console.log("\n[Assistant]:", event.data.content);
      } else if (event.type === "session.error") {
        console.error("\n[Error event]:", event.data.message);
      } else if (event.type === "tool.execution_start") {
        console.log(`\n[Tool Exec Start]: ${event.data.toolName}`);
      } else if (event.type === "assistant.message_delta") {
        process.stdout.write(event.data.deltaContent);
      }
    });

    // 10 minutes timeout
    await session.sendAndWait({ prompt }, 600000);

    console.log("\nDone!");
  } catch (err) {
    console.error("Error running demo:", err);
  } finally {
    // Basic cleanup
    // await client.stop(); // Sometimes stop() hangs if not handled perfectly, but we should try.
    // For demo script, process.exit is often cleaner if stop hangs.
    process.exit(0);
  }
}

main();
