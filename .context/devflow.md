# What I built

I built DevFlow - https://devflow.aevr.space/
A simple tool that allows me to set up an agent on my machine that can receive tasks remotely from channels like telegram, slack and the web and get things done.
It uses Github Copilot CLI - https://github.com/features/copilot/cli, https://github.com/github/copilot-cli/blob/main/README.md and GitHub Copilot CLI SDKs - https://github.com/github/copilot-sdk to work on these tasks and update the user in realtime.

## Project Overview

DevFlow is an AI-powered DevOps orchestration platform that bridges your local development environment with your communication channels. It allows you to execute complex coding tasks, debug issues, and manage your infrastructure simply by chatting with an agent on Slack or Telegram.

The system is designed to be **self-hosted and secure**, ensuring your code never leaves your machine while still leveraging the intelligence of GitHub Copilot.

## Key Features

- **🤖 Copilot-Powered Workflows**: Leverage GitHub Copilot's intelligence to fix bugs, implement new features, explain complex code, and review pull requests.
- **🔒 Self-Hosted & Secure**: The agent runs on your local infrastructure. Your code remains on your machine and is never uploaded to the DevFlow platform.
- **📱 ChatOps Integration**: seamless control via Slack and Telegram. Send commands like `!fix "login page error"` directly from your chat app.
- **⚡ Real-time Updates**: Watch the agent work in real-time with streaming progress updates sent back to your chat window.
- **🔧 Extensible Tools**: Uses the Copilot SDK's tool capability to perform Git operations, run tests, manage files, and interact with GitHub APIs.

## Architecture

The system consists of two main components:

1.  **Pinga Web Platform** (`apps/web`): The SaaS dashboard and orchestration layer. It handles user authentication, connections to Slack/Telegram, and queues tasks.
2.  **Agent CLI** (`@untools/devflow` in `apps/agent`): The all-in-one local agent. It authenticates with the platform, polls for pending tasks, and **locally executes** them using the embedded GitHub Copilot SDK.

_Note: `apps/agent-host` exists as a standalone runner but the primary local workflow runs directly within the CLI._

### Data Flow

```mermaid
graph TD
    User[User] -->|Chat Message| SlackTelegram[Slack/Telegram]
    SlackTelegram -->|Webhook| Web[DevFlow Platform]
    Web -->|Queue Task| DB[(Database)]
    CLI[Agent CLI] -->|Poll| Web
    CLI -->|Execute| SDK[Copilot SDK (Embedded)]
    SDK -->|Read/Write| LocalCode[Local Codebase]
    CLI -->|Stream Progress| Web
    Web -->|Notify| SlackTelegram
    SlackTelegram -->|Update| User
```

## Technical Stack

- **Runtime**: Node.js & TypeScript
- **AI Engine**: GitHub Copilot CLI & SDK (`@github/copilot-sdk`)
- **Backend**: Next.js (Web Platform), Express (Agent Host)
- **Communication**: REST API, Polling, Webhooks
- **Integration**: Slack API, Telegram Bot API, GitHub API

## Supported Workflows

The agent comes equipped with specialized workflows powered by Copilot:

- `fix-bug`: Analyzes an issue description, reproduces it with tests (if possible), and applies a fix.
- `feature`: Implements a new feature based on requirements, complete with tests and documentation.
- `explain`: Generates documentation or explains complex sections of code.
- `review-pr`: Reviews a pull request and offers suggestions for best practices and improvements.

## Security Model

DevFlow prioritizes security by design:

- **Local Execution**: All code modifications happen locally found within your environment.
- **Secure Configuration**: Agent credentials and tokens are stored securely with restricted permissions (`0o600`).
- **No Code Exfiltration**: Code is processed by local LLM calls or secure Copilot APIs, not stored on DevFlow servers.

## Architecture Analysis: Implementation Review

A review of how the platform _should_ work (ideal) versus how it _actually_ works (implementation).

### 1. Task Distribution

- **Ideal**: Push-based architecture using WebSockets/Persistent Connections. The platform pushes tasks instantly to the agent.
- **Actual**: Pull-based architecture. The Agent CLI polls the `GET /api/agents/[id]/commands` endpoint every 5s (`apps/agent/src/cli.ts`).
- **Trade-off**: Polling is simpler to implement and works robustly through NAT/firewalls without complex socket management, but introduces a slight latency.

### 2. Job Queuing

- **Ideal**: Dedicated job queue (Redis/BullMQ) to manage retries, concurrency, and backpressure.
- **Actual**: Database-as-queue. Tasks are stored in MongoDB (`TaskAssignment` collection) with `status: "pending"`. The API queries this collection directly (`apps/web/app/api/agents/[id]/commands/route.ts`).
- **Trade-off**: Simple for MVP scale. No extra infrastructure (Redis) required.

### 3. Execution Engine

- **Ideal**: Sandboxed environment (Docker) to preventing accidental damage to the host.
- **Actual**: Local execution via `Copilot SDK` embedded in the CLI (`apps/agent/src/copilot/flows`). The agent runs with the user's permissions in their terminal.
- **Trade-off**: "Zero-config" experience—it just works on your machine with your existing tools/credentials. Security relies on the user trusting the agent commands.

### 4. Code Structure

- `apps/agent/src/cli.ts`: The Monolithic entry point. Handles Auth -> Polling -> Execution -> Reporting.
- `apps/agent-host`: An Express server implementation that appears to be a separate "Hosted" runner concept, partially duplicating the CLI's logic but designed for a persistent server environment rather than a terminal user. The active development seems focused on the CLI.
