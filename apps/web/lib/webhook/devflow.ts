// Devflow command detection and parsing
// Detects !devflow commands in Telegram/Slack messages

export interface DevflowCommand {
  isDevflow: boolean;
  intent?: "fix-bug" | "feature" | "explain" | "review-pr" | "deploy";
  description: string;
  repo?: string;
  branch?: string;
  context?: Record<string, unknown>;
  rawText: string;
}

export function parseDevflowCommand(text: string): DevflowCommand {
  const trimmed = text.trim();

  // Check if message starts with !devflow
  if (!trimmed.toLowerCase().startsWith("!devflow")) {
    return {
      isDevflow: false,
      description: "",
      rawText: text,
    };
  }

  // Parse the command
  const match = trimmed.match(
    /^!devflow\s+(fix-bug|fix|feature|explain|review-pr|deploy)\s+(.+)$/i,
  );

  if (!match) {
    return {
      isDevflow: true,
      description: "Invalid devflow command format",
      rawText: text,
    };
  }

  const [, intentStr, description] = match;
  let intent: "fix-bug" | "feature" | "explain" | "review-pr" | "deploy";

  // Map "fix" to "fix-bug"
  if (intentStr.toLowerCase() === "fix") {
    intent = "fix-bug";
  } else {
    intent = intentStr.toLowerCase() as
      | "feature"
      | "explain"
      | "review-pr"
      | "deploy";
  }

  // Parse description for repo and branch
  // Format: "repo-name [branch-name] description"
  // Example: "!devflow fix-bug owner/repo main Fix the auth bug"
  const descriptionParts = description.trim().split(/\s+/);

  let repo = "";
  let branch = "";
  let actualDescription = "";

  if (descriptionParts.length > 0) {
    // Check if first part looks like a repo (contains /)
    if (descriptionParts[0].includes("/")) {
      repo = descriptionParts[0];
      descriptionParts.shift();

      // Check if next part looks like a branch (no spaces, alphanumeric with - or _)
      if (
        descriptionParts.length > 0 &&
        /^[a-zA-Z0-9\-_]+$/.test(descriptionParts[0])
      ) {
        branch = descriptionParts[0];
        descriptionParts.shift();
      }
    }

    // Rest is the description
    actualDescription = descriptionParts.join(" ");
  }

  return {
    isDevflow: true,
    intent,
    description: actualDescription || description,
    repo: repo || undefined,
    branch: branch || undefined,
    rawText: text,
  };
}

export function extractDevflowInfo(message: string): DevflowCommand | null {
  const command = parseDevflowCommand(message);
  return command.isDevflow ? command : null;
}

export function getDevflowHelpText(): string {
  return `🤖 *Devflow Agent*

*Dashboard & Tasks*
🔗 [Dashboard](https://devflow-web.vercel.app/dashboard)
📋 [View Tasks](https://devflow-web.vercel.app/dashboard/tasks)

*Available Commands*

1️⃣ *List Active Agents*
   \`Can you list my active agents?\`

2️⃣ *Execute Tasks*
   \`Ask my agent to [task description]\`
   Example: _"Ask my agent to update the README"_

3️⃣ *DevFlow Automation* (Requires Repo Access)
   *Fix Bugs*: \`!devflow fix owner/repo Fix the auth bug\`
   *Feature*: \`!devflow feature owner/repo Add CSV export\`
   *Explain*: \`!devflow explain owner/repo Explain auth flow\`

*Tips*
• Ensure your CLI agent is running: \`devflow start\`
• Connect Telegram groups via the Dashboard Settings.`;
}
