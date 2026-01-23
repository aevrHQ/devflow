import simpleGit, { SimpleGit } from "simple-git";
import * as path from "path";
import { getRepoPath, executeCommand, ToolError, removeDirectory } from "./utils.js";

export interface GitOperationInput {
  action: "clone" | "create_branch" | "commit" | "push" | "pull" | "status";
  repo: string;
  branchName?: string;
  message?: string;
  remote?: string;
  author?: { name: string; email: string };
}

export interface GitOperationResult {
  action: string;
  success: boolean;
  output?: string;
  error?: string;
  branchName?: string;
}

export class GitTool {
  private gitInstances: Map<string, SimpleGit> = new Map();

  private getGit(repoPath: string): SimpleGit {
    if (!this.gitInstances.has(repoPath)) {
      this.gitInstances.set(repoPath, simpleGit(repoPath));
    }
    return this.gitInstances.get(repoPath)!;
  }

  async clone(
    repoUrl: string,
    targetPath: string,
    branch?: string
  ): Promise<GitOperationResult> {
    try {
      const args = [repoUrl, targetPath];
      if (branch) {
        args.push("--branch", branch);
      }

      executeCommand(`git clone ${args.join(" ")}`);

      return {
        action: "clone",
        success: true,
        output: `Cloned ${repoUrl} to ${targetPath}`,
      };
    } catch (error) {
      throw new ToolError(
        `Failed to clone repository: ${error}`,
        "git_clone"
      );
    }
  }

  async createBranch(
    repoPath: string,
    branchName: string,
    fromBranch: string = "main"
  ): Promise<GitOperationResult> {
    try {
      const git = this.getGit(repoPath);

      // Ensure we're on a clean state
      await git.fetch();
      await git.checkout(fromBranch);

      // Create and checkout new branch
      await git.checkoutLocalBranch(branchName);

      return {
        action: "create_branch",
        success: true,
        branchName,
        output: `Created branch ${branchName}`,
      };
    } catch (error) {
      throw new ToolError(
        `Failed to create branch: ${error}`,
        "git_create_branch"
      );
    }
  }

  async commit(
    repoPath: string,
    message: string,
    author?: { name: string; email: string }
  ): Promise<GitOperationResult> {
    try {
      const git = this.getGit(repoPath);

      // Check if there are changes to commit
      const status = await git.status();
      if (status.files.length === 0) {
        return {
          action: "commit",
          success: true,
          output: "No changes to commit",
        };
      }

      // Stage all changes
      await git.add(".");

      // Configure author if provided
      if (author) {
        await git.addConfig("user.name", author.name);
        await git.addConfig("user.email", author.email);
      }

      // Commit
      const result = await git.commit(message);

      return {
        action: "commit",
        success: true,
        output: `Committed with hash: ${result.commit}`,
      };
    } catch (error) {
      throw new ToolError(`Failed to commit: ${error}`, "git_commit");
    }
  }

  async push(
    repoPath: string,
    remote: string = "origin",
    branch?: string
  ): Promise<GitOperationResult> {
    try {
      const git = this.getGit(repoPath);

      // Get current branch if not specified
      if (!branch) {
        const branchResult = await git.revparse(["--abbrev-ref", "HEAD"]);
        branch = branchResult.trim();
      }

      await git.push(remote, branch);

      return {
        action: "push",
        success: true,
        output: `Pushed branch ${branch} to ${remote}`,
      };
    } catch (error) {
      throw new ToolError(`Failed to push: ${error}`, "git_push");
    }
  }

  async pull(
    repoPath: string,
    remote: string = "origin",
    branch?: string
  ): Promise<GitOperationResult> {
    try {
      const git = this.getGit(repoPath);

      if (branch) {
        await git.pull(remote, branch);
      } else {
        await git.pull();
      }

      return {
        action: "pull",
        success: true,
        output: `Pulled latest changes from ${remote}`,
      };
    } catch (error) {
      throw new ToolError(`Failed to pull: ${error}`, "git_pull");
    }
  }

  async getStatus(repoPath: string): Promise<GitOperationResult> {
    try {
      const git = this.getGit(repoPath);
      const status = await git.status();

      return {
        action: "status",
        success: true,
        output: JSON.stringify(status, null, 2),
      };
    } catch (error) {
      throw new ToolError(
        `Failed to get status: ${error}`,
        "git_status"
      );
    }
  }

  async getCurrentBranch(repoPath: string): Promise<string> {
    try {
      const git = this.getGit(repoPath);
      const branch = await git.revparse(["--abbrev-ref", "HEAD"]);
      return branch.trim();
    } catch (error) {
      throw new ToolError(
        `Failed to get current branch: ${error}`,
        "git_current_branch"
      );
    }
  }

  async cleanup(repoPath: string): Promise<void> {
    try {
      this.gitInstances.delete(repoPath);
      await removeDirectory(repoPath);
    } catch (error) {
      console.warn(`Failed to cleanup repo: ${error}`);
    }
  }
}

// Factory function for Copilot SDK tool definition
export function createGitOperationsTool(): any {
  const gitTool = new GitTool();

  return {
    name: "git_operations",
    description: "Perform git operations like clone, branch, commit, push",
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["clone", "create_branch", "commit", "push", "pull", "status"],
          description: "Git operation to perform",
        },
        repo: {
          type: "string",
          description: "Repository URL (for clone) or local path (for others)",
        },
        branchName: {
          type: "string",
          description: "Branch name (for create_branch)",
        },
        message: {
          type: "string",
          description: "Commit message (for commit)",
        },
        remote: {
          type: "string",
          description: "Remote name (default: origin)",
        },
        author: {
          type: "object",
          description: "Author info for commits",
          properties: {
            name: { type: "string" },
            email: { type: "string" },
          },
        },
      },
      required: ["action", "repo"],
    },
    handler: async (input: GitOperationInput): Promise<GitOperationResult> => {
      try {
        switch (input.action) {
          case "clone": {
            const repoPath = await getRepoPath(input.repo);
            return await gitTool.clone(input.repo, repoPath);
          }

          case "create_branch": {
            const repoPath = await getRepoPath(input.repo);
            if (!input.branchName) {
              throw new ToolError(
                "branchName required for create_branch",
                "git_operations"
              );
            }
            return await gitTool.createBranch(repoPath, input.branchName);
          }

          case "commit": {
            const repoPath = await getRepoPath(input.repo);
            if (!input.message) {
              throw new ToolError(
                "message required for commit",
                "git_operations"
              );
            }
            return await gitTool.commit(repoPath, input.message, input.author);
          }

          case "push": {
            const repoPath = await getRepoPath(input.repo);
            return await gitTool.push(
              repoPath,
              input.remote,
              input.branchName
            );
          }

          case "pull": {
            const repoPath = await getRepoPath(input.repo);
            return await gitTool.pull(
              repoPath,
              input.remote,
              input.branchName
            );
          }

          case "status": {
            const repoPath = await getRepoPath(input.repo);
            return await gitTool.getStatus(repoPath);
          }

          default:
            throw new ToolError(
              `Unknown action: ${input.action}`,
              "git_operations"
            );
        }
      } catch (error) {
        if (error instanceof ToolError) throw error;
        throw new ToolError(
          `Git operation failed: ${error}`,
          "git_operations"
        );
      }
    },
  };
}
