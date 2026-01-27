import { CopilotClient } from "@github/copilot-sdk";
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

    console.log("Pinging server...");
    const ping = await client.ping();
    console.log(`Ping success: ${JSON.stringify(ping)}`);

    console.log("Creating session...");
    const session = await client.createSession({
      model: "gpt-5-mini",
      streaming: true,
    });

    console.log(`Session created (${session.sessionId}). Sending prompt...`);

    // Prompt relying on built-in tools
    const prompt =
      "Please list the files in the current directory and then create a file named 'builtin-test.txt' with the content 'Created via built-in tools'.";

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
    process.exit(0);
  }
}

main();
