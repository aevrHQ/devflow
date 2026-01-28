import { getUserStats } from "@/lib/stats";
import { getCurrentUser } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Installation from "@/models/Installation";
import Agent from "@/models/Agent";
import ActivityFeed from "./ActivityFeed";
import {
  Plus,
  Github,
  Activity,
  CheckCircle,
  Zap,
  AlertCircle,
} from "lucide-react";
import { Types } from "mongoose";
import Link from "next/link";
import { Button } from "@/components/ui/aevr/button";

interface DashboardPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage(props: DashboardPageProps) {
  const user = await getCurrentUser();
  if (!user) return null;

  const searchParams = await props.searchParams;
  const installationId = searchParams.installation_id;
  const setupAction = searchParams.setup_action;

  await connectToDatabase();

  // Handle Installation Linking
  let successMessage = "";
  if (
    installationId &&
    (setupAction === "install" || setupAction === "update")
  ) {
    const id = parseInt(
      Array.isArray(installationId) ? installationId[0] : installationId,
      10,
    );
    if (!isNaN(id)) {
      // Find the installation (it should have been created by the webhook)
      // We look for one with the matching ID.
      // If it has no userId, we claim it.
      // If it has THIS user's userId, we ignore (already linked).
      // If it has ANOTHER user's userId, we error (security).

      const installation = await Installation.findOne({ installationId: id });

      if (installation) {
        if (!installation.userId) {
          installation.userId = new Types.ObjectId(user.userId);
          await installation.save();
          successMessage = "Successfully connected GitHub account!";
        } else if (installation.userId.toString() === user.userId) {
          successMessage = "Account is already connected.";
        } else {
          console.warn(
            "Attempt to claim installation belonging to another user",
          );
        }
      } else {
        // Installation not found yet (maybe webhook is slow?)
        // In a clearer flow, we might wait or retry, but for MVP we just show nothing
      }
    }
  }

  // Fetch linked installations
  const installations = await Installation.find({
    userId: new Types.ObjectId(user.userId),
  });

  // Fetch stats (now uses NotificationLog)
  const stats = await getUserStats(user.userId);

  // Fetch agents
  const agents = await Agent.find({ userId: new Types.ObjectId(user.userId) });

  const githubAppName = process.env.GITHUB_APP_NAME || "trydevflow";
  const githubInstallUrl = `https://github.com/apps/${githubAppName}/installations/new`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">Welcome to your dashboard</p>
        </div>
        <a
          href={githubInstallUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Repository
        </a>
      </div>

      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-4 rounded-lg flex items-center gap-2 border border-green-100 dark:border-green-900">
          <CheckCircle className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {installationId && !successMessage && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 p-4 rounded-lg flex items-start gap-2 border border-yellow-100 dark:border-yellow-900">
          <Activity className="w-5 h-5 mt-0.5" />
          <div>
            <p className="font-semibold">Connection Pending...</p>
            <p className="text-sm mt-1">
              We received the redirect from GitHub (ID:{" "}
              {Array.isArray(installationId)
                ? installationId[0]
                : installationId}
              ), but we haven&apos;t received the configuration data yet.
            </p>
            <p className="text-sm mt-2">
              <strong>Troubleshooting:</strong>
              <br />
              1. Ensure your GitHub App <strong>Webhook URL</strong> is set to{" "}
              <code>https://&lt;your-ngrok-url&gt;/api/webhook/github</code>.
              <br />
              2. Ensure <strong>Content type</strong> is{" "}
              <code>application/json</code>.<br />
              3. Check your terminal to see if the webhook was received.
            </p>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card text-card-foreground p-6 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Events (24h)
            </h3>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold">{stats.eventsLast24Hours}</p>
        </div>

        <div className="bg-card text-card-foreground p-6 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Success Rate
            </h3>
            <Zap className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold">{stats.successRate}%</p>
        </div>

        <div className="bg-card text-card-foreground p-6 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Failed
            </h3>
            <AlertCircle className="w-4 h-4 text-destructive" />
          </div>
          <p className="text-2xl font-bold">{stats.failedEvents}</p>
        </div>
      </div>

      {/* Agents / Installations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Agents */}
        <div className="bg-card text-card-foreground p-6 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-muted-foreground" />
              Connected Agents
            </h2>
            <Link
              href="/help/agents"
              className="text-xs text-blue-500 hover:underline"
            >
              Setup Guide
            </Link>
          </div>

          {agents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">No agents connected yet.</p>
              <code className="bg-muted px-2 py-1 rounded-sm text-xs">
                devflow init
              </code>
            </div>
          ) : (
            <div className="space-y-3">
              {agents.map((agent) => {
                const now = new Date().getTime();
                const lastSeen = new Date(agent.lastHeartbeat).getTime();
                const diffSec = (now - lastSeen) / 1000;

                let displayStatus = "offline";
                if (diffSec < 45) {
                  // 45s buffer for network latency
                  displayStatus = "online";
                } else if (diffSec < 5 * 60) {
                  // 5 minutes
                  displayStatus = "stale";
                }

                // If the DB explicitly says offline, respect it
                if (agent.status === "offline") displayStatus = "offline";

                return (
                  <div
                    key={agent.agentId}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          displayStatus === "online"
                            ? "bg-green-500"
                            : displayStatus === "stale"
                              ? "bg-yellow-500"
                              : "bg-neutral-500"
                        }`}
                        title={`${displayStatus} (Last seen: ${Math.round(diffSec)}s ago)`}
                      />
                      <div>
                        <p className="font-medium text-sm">{agent.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {agent.platform} • {agent.version}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {agent.agentId.substring(0, 12)}...
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Installations / Recent Activity Column */}
        <div className="space-y-6">
          <div className="bg-card text-card-foreground p-6 rounded-xl border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Github className="w-5 h-5 text-muted-foreground" />
                Connected Accounts
              </h2>
              <span className="bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full text-xs font-medium">
                {installations.length}
              </span>
            </div>

            {installations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-4">No GitHub accounts connected yet.</p>
                <a
                  href={githubInstallUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline text-sm"
                >
                  Install the GitHub App to get started
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {installations.map((inst) => (
                  <div
                    key={inst.installationId}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center border border-border text-xs font-bold text-foreground">
                        {(inst.accountLogin[0] || "?").toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {inst.accountLogin}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {inst.accountType}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ID: {inst.installationId}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-card text-card-foreground p-6 rounded-xl border border-border">
            <ActivityFeed />
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-linear-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950 rounded-2xl p-6 border border-border">
        <div className="flex items-start gap-4">
          <div className="text-4xl">📚</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">
              Need Help Getting Started?
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Check out our guides to make the most of DevFlow
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant={"default"} asChild>
                <Link href="/help/getting-started">🚀 Getting Started</Link>
              </Button>
              <Button variant={"default"} asChild>
                <Link href="/help/telegram-groups">👥 Telegram Groups</Link>
              </Button>
              <Button variant={"default"} asChild>
                <Link href="/help/filtering">🎯 Webhook Filtering</Link>
              </Button>
              <Button variant={"default"} asChild>
                <Link href="/help/sources">🔗 Webhook Sources</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
