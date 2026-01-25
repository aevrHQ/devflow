// Utility functions for tool operations
import * as fs from "fs/promises";
import * as path from "path";
import { execSync } from "child_process";

export class ToolError extends Error {
  constructor(
    message: string,
    public tool: string,
    public code?: string,
  ) {
    super(message);
    this.name = "ToolError";
  }
}

export async function ensureRepoStoragePath(): Promise<string> {
  const storagePath = process.env.REPO_STORAGE_PATH || "/tmp/devflow-repos";
  try {
    await fs.mkdir(storagePath, { recursive: true });
    return storagePath;
  } catch (error) {
    throw new ToolError(
      `Failed to create storage directory: ${error}`,
      "storage",
    );
  }
}

export async function getRepoPath(
  repo: string,
  storagePath?: string,
  localPath?: string,
): Promise<string> {
  if (localPath) return localPath;
  const storage = storagePath || (await ensureRepoStoragePath());
  return path.join(storage, repo.replace("/", "-"));
}

export function executeCommand(
  command: string,
  cwd?: string,
  timeout: number = 60000,
): string {
  try {
    const result = execSync(command, {
      cwd,
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      timeout,
      stdio: "pipe",
    });
    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new ToolError(`Command failed: ${errorMsg}`, "exec", "EXEC_FAILED");
  }
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch (error) {
    throw new ToolError(
      `Failed to read file: ${error}`,
      "read_file",
      "FILE_READ_FAILED",
    );
  }
}

export async function writeFile(
  filePath: string,
  content: string,
): Promise<void> {
  try {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, content, "utf-8");
  } catch (error) {
    throw new ToolError(
      `Failed to write file: ${error}`,
      "write_file",
      "FILE_WRITE_FAILED",
    );
  }
}

export async function listFiles(
  dirPath: string,
  pattern?: RegExp,
): Promise<string[]> {
  try {
    const files = await fs.readdir(dirPath, { recursive: true });
    return pattern ? files.filter((f) => pattern.test(f)) : files;
  } catch (error) {
    throw new ToolError(
      `Failed to list files: ${error}`,
      "list_files",
      "LIST_FAILED",
    );
  }
}

export async function removeDirectory(dirPath: string): Promise<void> {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch (error) {
    throw new ToolError(
      `Failed to remove directory: ${error}`,
      "cleanup",
      "CLEANUP_FAILED",
    );
  }
}
