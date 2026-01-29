import axios from "axios";

export function formatError(error: any): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const method = error.config?.method?.toUpperCase();
    const url = error.config?.url;
    const message = error.message;
    const responseData = error.response?.data
      ? JSON.stringify(error.response.data)
      : "";

    // Cleaner error message
    let output = `AxiosError: ${message}`;
    if (status) output += ` (Status: ${status})`;
    if (method && url) output += ` [${method} ${url}]`;
    if (responseData) output += `\nResponse: ${responseData}`;

    return output;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

import simpleGit from "simple-git";

export async function getRepoInfo(): Promise<{
  owner: string;
  name: string;
  full_name: string;
} | null> {
  try {
    const git = simpleGit();
    const isRepo = await git.checkIsRepo();
    if (!isRepo) return null;

    const remotes = await git.getRemotes(true);
    const origin = remotes.find((r) => r.name === "origin") || remotes[0];

    if (!origin) return null;

    const url = origin.refs.fetch || origin.refs.push;
    // Parse URL (supports HTTPS and SSH)
    // https://github.com/owner/repo.git
    // git@github.com:owner/repo.git
    const match = url.match(/[:/]([^/]+)\/([^/.]+)(?:\.git)?$/);

    if (match) {
      return {
        owner: match[1],
        name: match[2],
        full_name: `${match[1]}/${match[2]}`,
      };
    }
    return null;
  } catch (error) {
    // console.warn("Failed to get repo info:", error);
    return null;
  }
}
