# Devflow Custom Tools

Custom tools that the Copilot Agent can call to perform development operations.

## Overview

Each tool is a TypeScript class with a factory function that creates a Copilot SDK-compatible tool definition. Tools follow this pattern:

```typescript
// Core implementation
export class MyTool {
  async doSomething(input: Input): Promise<Result> { ... }
}

// Factory for Copilot SDK
export function createMyTool(): any {
  const tool = new MyTool();
  return {
    name: "tool_name",
    description: "What this tool does",
    parameters: { /* JSON Schema */ },
    handler: async (input) => { /* call tool.method(input) */ }
  };
}
```

## Tools Implemented

### 1. Git Operations (`git.ts`)

Perform git operations: clone, branch, commit, push, pull, status.

**Class**: `GitTool`

**Methods**:

- `clone(repoUrl, targetPath, branch?)` - Clone a repository
- `createBranch(repoPath, branchName, fromBranch)` - Create and checkout a new branch
- `commit(repoPath, message, author?)` - Commit staged changes
- `push(repoPath, remote, branch?)` - Push commits to remote
- `pull(repoPath, remote, branch?)` - Pull changes from remote
- `getStatus(repoPath)` - Get repository status
- `getCurrentBranch(repoPath)` - Get current branch name
- `cleanup(repoPath)` - Clean up local repository

**Usage in Copilot**:

```typescript
// Copilot will call this tool with:
{
  "action": "create_branch",
  "repo": "owner/repo",
  "branchName": "fix/issue-123"
}
```

---

### 2. Test Runner (`tests.ts`)

Run test suites and capture results.

**Class**: `TestRunner`

**Methods**:

- `runTests(input)` - Execute tests with auto-detection of package manager
- `detectPackageManager(repoPath)` - Detect npm/yarn/pnpm
- `findTestFiles(repoPath, pattern)` - Find test files matching pattern

**Features**:

- Auto-detects npm/yarn/pnpm from lock files
- Supports custom test commands
- Can filter by test pattern
- Optionally generates coverage reports
- Parses test output for pass/fail counts

**Usage in Copilot**:

```typescript
{
  "repoPath": "/tmp/devflow-repos/owner-repo",
  "coverage": true,
  "pattern": "auth/*.test.ts"
}
```

---

### 3. File I/O (`files.ts`)

Read, write, and list files in repositories.

**Class**: `FileManager`

**Tools**:

1. **read_file** - Read file contents
   - Auto-detects file language (TypeScript, Python, etc)
   - Respects max size limit (default: 1MB)
   - Returns truncation flag if file exceeds limit

2. **write_file** - Write/update files
   - Auto-creates parent directories
   - Returns bytes written

3. **list_files** - List files matching pattern
   - Glob-like pattern support
   - Max results limit (default: 100)

**Language Detection**:
Maps file extensions to syntax highlighting languages:

- `.ts, .tsx` → typescript
- `.js, .jsx` → javascript
- `.py` → python
- `.go` → go
- `.rs` → rust
- And many more...

**Usage in Copilot**:

```typescript
// Read file
{
  "repoPath": "/tmp/repos/owner-repo",
  "filePath": "src/auth.ts"
}

// Write file
{
  "repoPath": "/tmp/repos/owner-repo",
  "filePath": "src/auth.ts",
  "content": "export function login() { ... }"
}

// List files
{
  "repoPath": "/tmp/repos/owner-repo",
  "pattern": "src/**/*.test.ts"
}
```

---

### 4. GitHub PR Operations (`github.ts`)

Create, list, and manage pull requests on GitHub.

**Class**: `GitHubPRManager`

**Methods**:

- `openPullRequest(input)` - Open a new PR
  - Supports draft PRs
  - Can add labels and assignees
  - Returns PR number and URL

- `getPullRequest(repo, prNumber)` - Get PR details
- `listPullRequests(repo, state, maxResults)` - List PRs
- `closePullRequest(repo, prNumber)` - Close a PR

**Requirements**:

- `GITHUB_TOKEN` environment variable set
- Token must have `repo` scope

**Usage in Copilot**:

```typescript
{
  "repo": "owner/repo",
  "title": "Fix authentication bug",
  "body": "Fixes #123\n\nChanges:\n- Fixed token validation",
  "head": "fix/auth-bug",
  "base": "main",
  "labels": ["bug", "urgent"],
  "assignees": ["reviewer1", "reviewer2"]
}
```

---

### 5. Progress Updates (`progress.ts`)

Send real-time progress updates back to Devflow for user notifications.

**Class**: `ProgressTracker`

**Methods**:

- `sendUpdate(input)` - Send progress update to Devflow

**Updates Include**:

- Current step description
- Progress percentage (0-1)
- Status (in_progress, completed, failed)
- Optional error message
- Timestamp

**Integration**:

- Calls Devflow's `/api/copilot/task-update` endpoint
- User receives notifications in Slack/Telegram
- Progress bar updates in real-time

**Usage in Copilot**:

```typescript
{
  "taskId": "task-123",
  "status": "in_progress",
  "step": "Running tests...",
  "progress": 0.5,
  "details": "Executing test suite with coverage"
}
```

---

## Utilities (`utils.ts`)

Helper functions used by all tools.

**Functions**:

- `ensureRepoStoragePath()` - Create `/tmp/devflow-repos`
- `getRepoPath(repo)` - Get local path for repo
- `executeCommand(cmd, cwd, timeout)` - Run shell command
- `fileExists(path)` - Check if file exists
- `readFile(path)` - Read file contents
- `writeFile(path, content)` - Write file
- `listFiles(dir, pattern)` - List matching files
- `removeDirectory(path)` - Recursively delete directory

**Custom Errors**:

- `ToolError` - Extended Error class with tool name and code
  ```typescript
  throw new ToolError("Descriptive message", "tool_name", "ERROR_CODE");
  ```

---

## Getting All Tools

The `getAllTools()` function returns all tool definitions ready for the Copilot SDK:

```typescript
import { getAllTools } from "./copilot/tools/index.js";

const tools = getAllTools();
// Returns: [git_operations, run_tests, read_file, write_file, list_files, open_pull_request, send_progress_update]

// Use in session
const session = await client.createSession({
  tools,
});
```

---

## Error Handling

All tools wrap errors in `ToolError` for consistent error handling:

```typescript
export class ToolError extends Error {
  constructor(
    message: string,
    public tool: string,
    public code?: string
  ) { ... }
}
```

Example:

```typescript
catch (error) {
  throw new ToolError(
    "Failed to clone repository: permission denied",
    "git_operations",
    "CLONE_FAILED"
  );
}
```

---

## Testing Tools

Each tool can be tested independently:

```bash
# Start a test session
npm run dev

# In another terminal, test git operations
curl -X POST http://localhost:3001/command \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "test-git",
    "source": { "channel": "telegram", "chatId": "123" },
    "payload": {
      "intent": "fix-bug",
      "repo": "owner/repo",
      "naturalLanguage": "Clone the repository first"
    }
  }'
```

---

## Storage & Cleanup

- Repositories are cloned to `REPO_STORAGE_PATH` (default: `/tmp/devflow-repos/`)
- Directory structure: `/tmp/devflow-repos/owner-repo/`
- Tools are responsible for cleanup after operations
- `GitTool.cleanup()` removes local copy

---

## Next Steps

Tools are ready to be integrated into workflows in Phase 3:

- **Fix Bug Workflow** - Uses git + tests + files + progress
- **Feature Implementation** - Uses git + files + tests + PR
- **Code Explanation** - Uses files + progress
- **PR Review** - Uses files + github
