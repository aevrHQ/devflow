# Connected Agents

DevFlow allows you to connect **DevFlow Agents** running on your local machine or servers directly to your dashboard. These agents can execute tasks, fix bugs, and run commands on your behalf.

## How to Connect an Agent

1. **Install the CLI Tool**
   Ensure you have the DevFlow CLI installed:

   ```bash
   npm install -g @untools/devflow
   ```

2. **Initialize & Start**
   Run the following command in your terminal:

   ```bash
   devflow start
   ```

   This will authenticate the agent with your DevFlow account.

3. **Verify Connection**
   Once started, refresh your [Dashboard](/dashboard). You should see your agent listed in the "Connected Agents" card.

## features

### 🤖 Chat with your Agent

You can interact with your connected agents via Telegram or Slack.

- **List Agents**: "Which agents are running?"
- **Dispatch Tasks**: "Ask my agent to fix the bug in user/repo"

### 🛡️ Secure & Local

Your code stays on your machine. The agent only receives instructions you approve and reports back progress.

## Troubleshooting

- **Agent Offline?** Ensure the terminal running `devflow start` is still active.
- **Authentication Error?** Try running `devflow login` again to refresh your tokens.
