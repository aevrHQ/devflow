import { executeCommand, ToolError } from "./utils.js";
import { getRepoPath } from "./utils.js";

export interface TestRunInput {
  repoPath: string;
  testCommand?: string;
  pattern?: string;
  coverage?: boolean;
  timeout?: number;
}

export interface TestRunResult {
  success: boolean;
  output: string;
  stderr?: string;
  exitCode: number;
  duration: number;
  testsPassed?: number;
  testsFailed?: number;
  coverage?: {
    lines: number;
    statements: number;
    functions: number;
    branches: number;
  };
}

export class TestRunner {
  async detectPackageManager(
    repoPath: string
  ): Promise<"npm" | "yarn" | "pnpm"> {
    try {
      // Check for lock files
      const { readFile } = await import("fs/promises");
      try {
        await readFile(`${repoPath}/pnpm-lock.yaml`);
        return "pnpm";
      } catch {
        try {
          await readFile(`${repoPath}/yarn.lock`);
          return "yarn";
        } catch {
          return "npm"; // Default to npm
        }
      }
    } catch {
      return "npm";
    }
  }

  async runTests(input: TestRunInput): Promise<TestRunResult> {
    const startTime = Date.now();

    try {
      const repoPath = input.repoPath;
      const pm = await this.detectPackageManager(repoPath);

      let command = input.testCommand;

      if (!command) {
        // Build default test command based on package manager
        const baseCommand = `${pm} ${pm === "npm" ? "run" : ""} test`;
        let fullCommand = baseCommand;

        if (input.pattern && pm === "npm") {
          fullCommand += ` -- ${input.pattern}`;
        } else if (input.pattern) {
          fullCommand += ` ${input.pattern}`;
        }

        if (input.coverage) {
          if (pm === "npm") {
            fullCommand = `${pm} run test -- --coverage`;
          } else {
            fullCommand += " --coverage";
          }
        }

        command = fullCommand;
      }

      const output = executeCommand(command, repoPath, input.timeout || 120000);

      const duration = Date.now() - startTime;

      // Try to parse test results from output
      const testsPassed = (output.match(/passed/gi) || []).length;
      const testsFailed = (output.match(/failed/gi) || []).length;

      return {
        success: true,
        output,
        exitCode: 0,
        duration,
        testsPassed,
        testsFailed,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        output: errorMsg,
        exitCode: 1,
        duration,
      };
    }
  }

  async findTestFiles(
    repoPath: string,
    pattern: string = "**/*.{test,spec}.{js,ts,jsx,tsx}"
  ): Promise<string[]> {
    try {
      const { execSync } = await import("child_process");
      const files = execSync(`find ${repoPath} -name "*.test.*" -o -name "*.spec.*"`, {
        encoding: "utf-8",
      })
        .split("\n")
        .filter(Boolean);

      return files;
    } catch (error) {
      throw new ToolError(
        `Failed to find test files: ${error}`,
        "find_tests"
      );
    }
  }
}

// Factory function for Copilot SDK tool definition
export function createTestRunnerTool(): any {
  const testRunner = new TestRunner();

  return {
    name: "run_tests",
    description: "Run test suite for a repository and capture results",
    parameters: {
      type: "object",
      properties: {
        repoPath: {
          type: "string",
          description: "Local repository path",
        },
        testCommand: {
          type: "string",
          description:
            "Custom test command (default: npm test or yarn test)",
        },
        pattern: {
          type: "string",
          description: "Test file pattern or specific test to run",
        },
        coverage: {
          type: "boolean",
          description: "Generate coverage report",
          default: false,
        },
        timeout: {
          type: "number",
          description: "Test timeout in milliseconds (default: 120000)",
        },
      },
      required: ["repoPath"],
    },
    handler: async (input: TestRunInput): Promise<TestRunResult> => {
      try {
        return await testRunner.runTests(input);
      } catch (error) {
        if (error instanceof ToolError) throw error;
        throw new ToolError(
          `Test execution failed: ${error}`,
          "run_tests"
        );
      }
    },
  };
}
