import axios from "axios";

/**
 * Validates a GitHub Personal Access Token by making a test request to the GitHub API
 * @param token GitHub PAT to validate
 * @returns true if valid, false otherwise
 */
export async function validateGitHubToken(token: string): Promise<{
  valid: boolean;
  username?: string;
  error?: string;
}> {
  try {
    const response = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
      timeout: 10000,
    });

    if (response.status === 200) {
      return {
        valid: true,
        username: response.data.login,
      };
    }

    return {
      valid: false,
      error: "Invalid response from GitHub API",
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return {
          valid: false,
          error: "Invalid or expired token",
        };
      }
      return {
        valid: false,
        error: error.message,
      };
    }
    return {
      valid: false,
      error: String(error),
    };
  }
}

/**
 * Prompts the user for their GitHub Personal Access Token
 * @returns The token entered by the user
 */
export async function promptForGitHubToken(): Promise<string> {
  const readline = await import("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    console.log("\n📝 GitHub Personal Access Token Required\n");
    console.log(
      "The agent needs a GitHub PAT to authenticate with Copilot SDK.",
    );
    console.log("Create one at: https://github.com/settings/tokens\n");
    console.log("Required scopes:");
    console.log("  - copilot (for Copilot API access)");
    console.log("  - repo (for repository operations)\n");

    rl.question("Enter your GitHub Personal Access Token: ", (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}
