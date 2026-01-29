import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import type { Argv } from "yargs";
import { randomBytes } from "crypto";
import * as fsSync from "fs";
import * as pathLib from "path";
import { formatError, getRepoInfo } from "./utils.js";

import type { DevFlowConfig } from "./config.js";
import {
  createDefaultConfig,
  saveConfig,
  validateConfig,
  loadConfig,
} from "./config.js";
import { initiateOAuthFlow, getTokenExpiration } from "./auth/oauth.js";
import { PlatformClient, type CommandRequest } from "./agent/client.js";
import { WorkflowFactory } from "./copilot/flows/index.js";
import axios from "axios";

// ===== INIT COMMAND =====

interface InitOptions {
  name?: string;
  platformUrl?: string;
  agentHostUrl?: string;
}

async function initCommand(options: InitOptions): Promise<void> {
  console.log("\n🚀 DevFlow Agent Initialization\n");

  const platformUrl =
    options.platformUrl ||
    process.env.PLATFORM_URL ||
    "https://devflow.aevr.space";

  console.log("📍 Platform URL:", platformUrl);
  console.log("⏳ Starting authentication flow...\n");

  try {
    // Initiate OAuth
    const token = await initiateOAuthFlow({
      platformUrl,
      clientId: process.env.GITHUB_CLIENT_ID || "devflow-agent-cli",
      redirectUri:
        process.env.OAUTH_REDIRECT_URI || "http://localhost:3333/callback",
    });

    console.log("✓ Authentication successful!");
    // Token has agent_id not agentId
    const agentId = (token as any).agent_id || (token as any).agentId;
    console.log(`✓ Agent ID: ${agentId}`);

    // Generate default agent name
    const agentName = options.name || `agent-${randomBytes(4).toString("hex")}`;

    // Register agent with platform to get JWT token
    console.log("\n🔐 Registering agent with platform...");
    let jwtToken: string;

    try {
      const registerResponse = await axios.post(
        `${platformUrl}/api/agents`,
        {
          agentId,
          name: agentName,
          version: "0.1.0",
          platform: process.platform,
          capabilities: ["git", "copilot"],
        },
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`, // GitHub token for initial auth
            "Content-Type": "application/json",
          },
          timeout: 10000,
        },
      );

      if (!registerResponse.data?.token) {
        throw new Error("No JWT token received from platform");
      }

      jwtToken = registerResponse.data.token;
      console.log("✓ Agent registered successfully");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          `❌ Agent registration failed: ${error.response?.status} ${error.response?.data?.error || error.message}`,
        );
      } else {
        console.error(`❌ Agent registration failed: ${error}`);
      }
      process.exit(1);
    }

    // Fetch GitHub token from platform (managed SaaS mode)
    let githubToken: string | undefined;

    try {
      console.log("\n🔍 Fetching GitHub credentials from platform...");
      const credentialsResponse = await axios.get(
        `${platformUrl}/api/auth/agent/credentials`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`, // Use JWT token, not OAuth token
          },
          timeout: 10000,
        },
      );

      if (credentialsResponse.data?.credentials?.github_token) {
        githubToken = credentialsResponse.data.credentials.github_token;
        console.log("✓ GitHub credentials synced from platform");

        // Validate the token
        const { validateGitHubToken } = await import("./auth/github-token.js");
        const validation = await validateGitHubToken(githubToken as string);

        if (validation.valid) {
          console.log(`✓ Token validated for user: ${validation.username}`);
        } else {
          console.warn(`⚠️  Token validation failed: ${validation.error}`);
          console.warn(
            "You may need to update your GitHub credentials on the platform.",
          );
          githubToken = undefined;
        }
      } else {
        console.log("⚠️  No GitHub credentials found on platform.");
        console.log(
          "   Add your GitHub token at: " + platformUrl + "/settings",
        );
      }
    } catch (error) {
      console.warn("\n⚠️  Could not fetch credentials from platform:");
      if (axios.isAxiosError(error)) {
        console.warn(
          `   ${error.response?.status}: ${error.response?.data?.error || error.message}`,
        );
      } else {
        console.warn(`   ${error}`);
      }
      console.log(
        "\n   You can add GitHub credentials later via the platform UI.",
      );
    }

    // Fallback: Manual token prompt (if platform doesn't have credentials)
    if (!githubToken) {
      console.log("\n📝 Alternatively, you can provide a GitHub token now:");
      console.log("   (or skip and configure it later in the platform)");

      try {
        const { promptForGitHubToken, validateGitHubToken } =
          await import("./auth/github-token.js");

        const manualToken = await promptForGitHubToken();

        if (manualToken) {
          const validation = await validateGitHubToken(manualToken);
          if (validation.valid) {
            githubToken = manualToken;
            console.log(`✓ Token validated for user: ${validation.username}`);
          } else {
            console.error(`❌ Token validation failed: ${validation.error}`);
          }
        }
      } catch (error) {
        console.error("\n⚠️  Token prompt error:", error);
      }
    }

    // Create and save config
    const config = createDefaultConfig(
      platformUrl,
      jwtToken, // Use JWT token from agent registration, not OAuth token
      agentId,
      agentName,
      options.agentHostUrl || process.env.AGENT_HOST_URL,
    );

    // Add GitHub token if provided
    if (githubToken) {
      config.credentials = {
        github_token: githubToken,
      };
    }

    const validation = validateConfig(config);
    if (!validation.valid) {
      console.error("❌ Configuration validation failed:");
      validation.errors.forEach((err: string) => console.error(`  - ${err}`));
      process.exit(1);
    }

    saveConfig(config);

    console.log("\n✅ Configuration complete!\n");
    console.log("📋 Configuration Summary:");
    console.log(`   Agent: ${agentName}`);
    console.log(`   Platform: ${platformUrl}`);
    if (githubToken) {
      console.log(`   GitHub: Configured ✓`);
    }
    console.log(`   Config Location: ~/.devflow/config.json\n`);
    console.log("🚀 Next Step:");
    console.log(`   devflow start\n`);
  } catch (error) {
    console.error(
      `\n❌ Initialization failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }
}

// ===== START COMMAND =====

interface StartOptions {
  pollInterval: number;
  debug: boolean;
}

async function startCommand(options: StartOptions): Promise<void> {
  console.log("\n🚀 DevFlow Agent Starting\n");

  const config = loadConfig();
  if (!config) {
    console.log("❌ No agent configured. Run 'devflow init' first.");
    process.exit(1);
  }

  const validation = validateConfig(config);
  if (!validation.valid) {
    console.error("❌ Configuration invalid:");
    validation.errors.forEach((err: string) => console.error(`  - ${err}`));
    process.exit(1);
  }

  if (options.debug) {
    console.log("📋 Debug Configuration:");
    console.log(`   Agent: ${config.agent.name}`);
    console.log(`   Platform: ${config.platform.url}`);
    console.log(`   Poll Interval: ${options.pollInterval}ms\n`);
  }

  // Initialize platform client
  const client = new PlatformClient(
    config.platform.url,
    config.agent.id,
    config.platform.api_key,
  );

  // Graceful shutdown
  let running = true;
  process.on("SIGINT", async () => {
    console.log("\n\n✓ Agent shutdown requested");
    running = false;

    console.log("🔌 Disconnecting from platform...");
    await client.disconnect();
    console.log("✓ Disconnected");

    setTimeout(() => process.exit(0), 1000);
  });

  // Send initial heartbeat to mark agent as online
  try {
    console.log("� Connecting to platform...");
    await client.heartbeat({
      cwd: process.cwd(),
      capabilities: ["git", "copilot"],
    });

    console.log(`✓ Agent online: ${config.agent.id}`);
    console.log(`✓ Listening for commands...\n`);
  } catch (error) {
    console.error(
      `❌ Connection failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    console.error(
      `   Check that the agent is registered and platform is accessible.`,
    );
    process.exit(1);
  }

  // Main polling loop
  let lastHeartbeat = 0;
  const pollInterval = parseInt(
    process.env.POLL_INTERVAL_MS || String(options.pollInterval),
    10,
  );
  const heartbeatInterval = parseInt(
    process.env.HEARTBEAT_INTERVAL_MS || "30000",
    10,
  );

  while (running) {
    try {
      // Heartbeat at configured interval
      if (Date.now() - lastHeartbeat > heartbeatInterval) {
        if (options.debug) {
          console.log("💓 Sending heartbeat...");
        }
        const heartbeatResponse = await client.heartbeat();

        // Check if agent was disconnected remotely
        if (heartbeatResponse.status === "disconnected") {
          console.log("\n\n🔌 Agent was disconnected remotely.");
          console.log("   Run 'devflow start' to reconnect.\n");
          process.exit(0);
        }

        lastHeartbeat = Date.now();
        if (options.debug) {
          console.log("💓 Heartbeat acknowledged");
        }
      }

      // Poll for commands
      if (options.debug) {
        // console.log("🔍 Polling for commands..."); // Too noisy if every 5s, maybe keep commented or use a higher verbosity level
        process.stdout.write("."); // Use a dot to show activity without spamming newlines
      }
      const commands = await client.getCommands();

      if (commands.length > 0) {
        if (options.debug) {
          console.log(`📨 Received ${commands.length} command(s)`);
        }

        commands.forEach((cmd: CommandRequest) => {
          console.log(`\n⚡ Executing: ${cmd.intent}`);
          console.log(`   Task ID: ${cmd.taskId}`);

          // Send progress update
          (async () => {
            try {
              await client.reportProgress(cmd.taskId, {
                taskId: cmd.taskId,
                status: "in_progress",
                step: cmd.intent,
                progress: 0.25,
              });
            } catch (err) {
              console.error(
                `Failed to report progress for task ${cmd.taskId}: ${formatError(err)}`,
              );
            }
          })();

          // Execute task LOCALLY using embedded Workflow Engine
          (async () => {
            try {
              console.log(`⚡ Executing task locally...`);

              // Build context
              let repo = cmd.repo || "";
              // If repo is missing or generic placeholder, try to detect from local git
              if (
                !repo ||
                repo === "miracleio/project" ||
                repo.includes("example.com")
              ) {
                const detected = await getRepoInfo();
                if (detected) {
                  repo = detected.full_name;
                  console.log(`   (Auto-detected repo: ${repo})`);
                }
              }

              const context = {
                taskId: cmd.taskId,
                intent: cmd.intent,
                repo,
                localPath: process.cwd(),
                branch: cmd.branch,
                naturalLanguage: cmd.description || "",
                source: {
                  channel: "cli" as const,
                  chatId: "local",
                  messageId: cmd.taskId,
                },
                sessionId: cmd.sessionId,
                // Use local GitHub token from config (more secure than platform credentials)
                localGitHubToken: config.credentials?.github_token,
                credentials: cmd.credentials,
              };

              // Set GitHub Token for Copilot SDK if available - REMOVED (Handled in WorkflowExecutor)
              // if (cmd.credentials?.github) {
              //   process.env.GITHUB_TOKEN = cmd.credentials.github;
              // }

              // Execute workflow directly
              // This uses the local file system and reports back to Platform via provided URL/Token
              await WorkflowFactory.executeWorkflow(
                context,
                config.platform.url,
                config.platform.api_key,
              );

              // Usage of agent-host URL is DEPRECATED/REMOVED in favor of local execution
              console.log(`✓ Workflow finished: ${cmd.taskId}`);
            } catch (error: any) {
              const errorMsg =
                error instanceof Error ? error.message : String(error);

              // Report failure via progress update (failTask method doesn't exist)
              await client.reportProgress(cmd.taskId, {
                taskId: cmd.taskId,
                status: "failed",
                step: "Workflow execution failed",
                progress: 1.0,
                details: errorMsg,
              });
              console.error(`✗ Task failed: ${cmd.taskId} - ${errorMsg}`);
              if (options.debug) {
                console.error("Full Error Details:", formatError(error));
              }
            }
          })();
        });
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, options.pollInterval));
    } catch (error) {
      console.error(`⚠ Poll error: ${formatError(error)}`);
      await new Promise((resolve) =>
        setTimeout(resolve, options.pollInterval * 2),
      );
    }
  }
}

// ===== CLI ROUTER =====

export async function runCLI(): Promise<void> {
  await yargs(hideBin(process.argv))
    .command(
      "init",
      "Initialize DevFlow Agent (requires authentication)",
      (y: Argv) =>
        y
          .option("name", {
            alias: "n",
            describe: "Agent name",
            type: "string",
          })
          .option("platform-url", {
            alias: "p",
            describe: "Platform URL",
            type: "string",
            default: "https://devflow.aevr.space",
          })
          .option("agent-host-url", {
            describe:
              "Agent Host URL (e.g. https://your-render-app.onrender.com)",
            type: "string",
          }),
      (argv: any) =>
        initCommand({
          name: argv.name,
          platformUrl: argv["platform-url"],
          agentHostUrl: argv["agent-host-url"],
        }),
    )
    .command(
      "start",
      "Start DevFlow Agent (polls for commands)",
      (y: Argv) =>
        y
          .option("poll-interval", {
            alias: "i",
            describe: "Polling interval in milliseconds",
            type: "number",
            default: 5000,
          })
          .option("debug", {
            alias: "d",
            describe: "Enable debug logging",
            type: "boolean",
            default: false,
          }),
      (argv: any) =>
        startCommand({
          pollInterval: argv["poll-interval"],
          debug: argv.debug,
        }),
    )
    .command("status", "Show agent status", async () => {
      const config = loadConfig();
      if (!config) {
        console.log("❌ No agent configured. Run 'devflow init' first.");
        process.exit(1);
      }
      console.log("\n✓ DevFlow Agent Status\n");
      console.log(`  Agent: ${config.agent.name}`);
      console.log(`  ID: ${config.agent.id}`);
      console.log(`  Platform: ${config.platform.url}`);
      console.log(`  Config: ~/.devflow/config.json\n`);
    })

    .option("help", {
      alias: "h",
      describe: "Show help",
      type: "boolean",
    })
    .epilogue(
      `
Examples:
  devflow init
  devflow start
  devflow status
  devflow start --debug
`,
    )
    .demandCommand(1, "Please specify a command")
    .strict()
    .parse();
}
