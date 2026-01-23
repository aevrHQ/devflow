// Export all custom tool definitions and factories

export { createGitOperationsTool, GitTool } from "./git.js";
export type { GitOperationInput, GitOperationResult } from "./git.js";

export { createTestRunnerTool, TestRunner } from "./tests.js";
export type { TestRunInput, TestRunResult } from "./tests.js";

export {
  createReadFileTool,
  createWriteFileTool,
  createListFilesTool,
  FileManager,
} from "./files.js";
export type {
  ReadFileInput,
  ReadFileResult,
  WriteFileInput,
  WriteFileResult,
  ListFilesInput,
  ListFilesResult,
} from "./files.js";

export { createOpenPullRequestTool, GitHubPRManager } from "./github.js";
export type { OpenPRInput, OpenPRResult } from "./github.js";

export { createProgressUpdateTool, ProgressTracker } from "./progress.js";
export type { ProgressUpdateInput, ProgressUpdateResult } from "./progress.js";

export { ToolError, executeCommand, ensureRepoStoragePath, getRepoPath } from "./utils.js";

// Import all factories for getAllTools
import {
  createGitOperationsTool,
  createTestRunnerTool,
  createReadFileTool,
  createWriteFileTool,
  createListFilesTool,
  createOpenPullRequestTool,
  createProgressUpdateTool,
} from "./index.js";

// Convenience function to get all tools at once
export function getAllTools(): any[] {
  return [
    createGitOperationsTool(),
    createTestRunnerTool(),
    createReadFileTool(),
    createWriteFileTool(),
    createListFilesTool(),
    createOpenPullRequestTool(),
    createProgressUpdateTool(),
  ];
}
