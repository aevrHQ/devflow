// Export all custom tool definitions and factories
import { createGitOperationsTool, GitTool } from "./git.js";
import { createTestRunnerTool, TestRunner } from "./tests.js";
import {
  createReadFileTool,
  createWriteFileTool,
  createListFilesTool,
  FileManager,
} from "./files.js";
import { createOpenPullRequestTool, GitHubPRManager } from "./github.js";
import { createProgressUpdateTool, ProgressTracker } from "./progress.js";
import {
  ToolError,
  executeCommand,
  ensureRepoStoragePath,
  getRepoPath,
} from "./utils.js";

export { createGitOperationsTool, GitTool };
export type { GitOperationInput, GitOperationResult } from "./git.js";

export { createTestRunnerTool, TestRunner };
export type { TestRunInput, TestRunResult } from "./tests.js";

export {
  createReadFileTool,
  createWriteFileTool,
  createListFilesTool,
  FileManager,
};
export type {
  ReadFileInput,
  ReadFileResult,
  WriteFileInput,
  WriteFileResult,
  ListFilesInput,
  ListFilesResult,
} from "./files.js";

export { createOpenPullRequestTool, GitHubPRManager };
export type { OpenPRInput, OpenPRResult } from "./github.js";

export { createProgressUpdateTool, ProgressTracker };
export type { ProgressUpdateInput, ProgressUpdateResult } from "./progress.js";

export { ToolError, executeCommand, ensureRepoStoragePath, getRepoPath };

// Convenience function to get all tools at once
// Optional: pass user's GitHub token for managed SaaS mode
export interface ToolOptions {
  githubToken?: string;
  encryptionKey?: string;
  localPath?: string;
  pingaUrl?: string;
  pingaSecret?: string;
}

export function getAllTools(options: ToolOptions = {}): any[] {
  return [
    // createGitOperationsTool(options), // Using built-in git tools
    createTestRunnerTool(),
    // createReadFileTool(options), // Using built-in file tools
    // createWriteFileTool(options), // Using built-in file tools
    // createListFilesTool(options), // Using built-in file tools
    createOpenPullRequestTool(options.githubToken, options.encryptionKey),
    createProgressUpdateTool(options.pingaUrl, options.pingaSecret),
  ];
}
