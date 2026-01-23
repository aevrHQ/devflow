import * as path from "path";
import { readFile, writeFile, fileExists, ToolError, listFiles } from "./utils.js";

export interface ReadFileInput {
  repoPath: string;
  filePath: string;
  maxSize?: number;
}

export interface ReadFileResult {
  success: boolean;
  content?: string;
  size: number;
  error?: string;
  language?: string;
  truncated?: boolean;
}

export interface WriteFileInput {
  repoPath: string;
  filePath: string;
  content: string;
  createDirs?: boolean;
}

export interface WriteFileResult {
  success: boolean;
  filePath: string;
  bytesWritten: number;
  error?: string;
}

export interface ListFilesInput {
  repoPath: string;
  pattern?: string;
  maxResults?: number;
}

export interface ListFilesResult {
  success: boolean;
  files: string[];
  count: number;
  error?: string;
}

export class FileManager {
  private readonly maxDefaultSize = 1024 * 1024; // 1MB

  async readFile(input: ReadFileInput): Promise<ReadFileResult> {
    try {
      const fullPath = path.join(input.repoPath, input.filePath);
      const exists = await fileExists(fullPath);

      if (!exists) {
        return {
          success: false,
          size: 0,
          error: `File not found: ${input.filePath}`,
        };
      }

      const content = await readFile(fullPath);
      const size = Buffer.byteLength(content);
      const maxSize = input.maxSize || this.maxDefaultSize;

      let truncated = false;
      let finalContent = content;

      if (size > maxSize) {
        finalContent = content.substring(0, maxSize);
        truncated = true;
      }

      return {
        success: true,
        content: finalContent,
        size,
        truncated,
        language: this.detectLanguage(input.filePath),
      };
    } catch (error) {
      return {
        success: false,
        size: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async writeFile(input: WriteFileInput): Promise<WriteFileResult> {
    try {
      const fullPath = path.join(input.repoPath, input.filePath);
      const content = input.content;
      const bytesWritten = Buffer.byteLength(content);

      await writeFile(fullPath, content);

      return {
        success: true,
        filePath: input.filePath,
        bytesWritten,
      };
    } catch (error) {
      return {
        success: false,
        filePath: input.filePath,
        bytesWritten: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async listFiles(input: ListFilesInput): Promise<ListFilesResult> {
    try {
      let pattern: RegExp | undefined;

      if (input.pattern) {
        // Convert glob-like pattern to regex
        const regexPattern = input.pattern
          .replace(/\./g, "\\.")
          .replace(/\*/g, ".*")
          .replace(/\?/g, ".");
        pattern = new RegExp(regexPattern);
      }

      const files = await listFiles(input.repoPath, pattern);
      const maxResults = input.maxResults || 100;
      const truncated = files.length > maxResults;
      const finalFiles = files.slice(0, maxResults);

      return {
        success: true,
        files: finalFiles,
        count: finalFiles.length,
      };
    } catch (error) {
      return {
        success: false,
        files: [],
        count: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private detectLanguage(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();

    const languageMap: Record<string, string> = {
      ".ts": "typescript",
      ".tsx": "typescript",
      ".js": "javascript",
      ".jsx": "javascript",
      ".py": "python",
      ".go": "go",
      ".rs": "rust",
      ".java": "java",
      ".cpp": "cpp",
      ".c": "c",
      ".h": "c",
      ".hpp": "cpp",
      ".json": "json",
      ".yaml": "yaml",
      ".yml": "yaml",
      ".xml": "xml",
      ".html": "html",
      ".css": "css",
      ".scss": "scss",
      ".sh": "bash",
      ".md": "markdown",
      ".sql": "sql",
    };

    return languageMap[ext] || "text";
  }
}

// Factory function for Copilot SDK tool definition - Read File
export function createReadFileTool(): any {
  const fileManager = new FileManager();

  return {
    name: "read_file",
    description: "Read contents of a file from a repository",
    parameters: {
      type: "object",
      properties: {
        repoPath: {
          type: "string",
          description: "Repository path",
        },
        filePath: {
          type: "string",
          description: "File path relative to repository root",
        },
        maxSize: {
          type: "number",
          description: "Maximum file size to read in bytes (default: 1MB)",
        },
      },
      required: ["repoPath", "filePath"],
    },
    handler: async (input: ReadFileInput): Promise<ReadFileResult> => {
      try {
        return await fileManager.readFile(input);
      } catch (error) {
        return {
          success: false,
          size: 0,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  };
}

// Factory function for Copilot SDK tool definition - Write File
export function createWriteFileTool(): any {
  const fileManager = new FileManager();

  return {
    name: "write_file",
    description: "Write or update a file in a repository",
    parameters: {
      type: "object",
      properties: {
        repoPath: {
          type: "string",
          description: "Repository path",
        },
        filePath: {
          type: "string",
          description: "File path relative to repository root",
        },
        content: {
          type: "string",
          description: "File content",
        },
        createDirs: {
          type: "boolean",
          description: "Create parent directories if they don't exist",
          default: true,
        },
      },
      required: ["repoPath", "filePath", "content"],
    },
    handler: async (input: WriteFileInput): Promise<WriteFileResult> => {
      try {
        return await fileManager.writeFile(input);
      } catch (error) {
        return {
          success: false,
          filePath: input.filePath,
          bytesWritten: 0,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  };
}

// Factory function for Copilot SDK tool definition - List Files
export function createListFilesTool(): any {
  const fileManager = new FileManager();

  return {
    name: "list_files",
    description: "List files in a repository directory",
    parameters: {
      type: "object",
      properties: {
        repoPath: {
          type: "string",
          description: "Repository path",
        },
        pattern: {
          type: "string",
          description: "File pattern to match (glob-like syntax)",
        },
        maxResults: {
          type: "number",
          description: "Maximum number of results to return (default: 100)",
        },
      },
      required: ["repoPath"],
    },
    handler: async (input: ListFilesInput): Promise<ListFilesResult> => {
      try {
        return await fileManager.listFiles(input);
      } catch (error) {
        return {
          success: false,
          files: [],
          count: 0,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  };
}
