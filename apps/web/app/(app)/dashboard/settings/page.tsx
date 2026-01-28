import { getCurrentUser } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import SettingsContent from "./SettingsContent";

import ProfileHeader from "@/components/Settings/ProfileHeader";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  await connectToDatabase();
  const dbUser = await User.findById(user.userId);
  const { default: Channel } = await import("@/models/Channel");
  const dbChannels = await Channel.find({ userId: user.userId }).sort({
    createdAt: 1,
  });

  // Serialize to plain objects
  const channels = JSON.parse(JSON.stringify(dbChannels));
  const preferences = dbUser?.preferences
    ? JSON.parse(JSON.stringify(dbUser.preferences))
    : { aiSummary: false, allowedSources: [] };

  const hasGithubToken = !!dbUser?.credentials?.github;
  const groqKeysCount = dbUser?.credentials?.groqApiKeys?.length || 0;

  // Fetch stats
  const { default: TaskAssignment } = await import("@/models/TaskAssignment");
  const { default: Agent } = await import("@/models/Agent");

  const totalTasks = await TaskAssignment.countDocuments({
    userId: user.userId,
  });
  const totalAgents = await Agent.countDocuments({ userId: user.userId });

  // Calculate hours saved (sum of duration of completed tasks)
  const completedTasks = await TaskAssignment.find({
    userId: user.userId,
    status: "completed",
    startedAt: { $exists: true },
    completedAt: { $exists: true },
  }).select("startedAt completedAt");

  const totalHours = completedTasks.reduce((acc, task) => {
    const start = new Date(task.startedAt).getTime();
    const end = new Date(task.completedAt!).getTime();
    return acc + (end - start) / (1000 * 60 * 60);
  }, 0);

  return (
    <SettingsContent
      user={user}
      channels={channels}
      preferences={preferences}
      hasGithubToken={hasGithubToken}
      groqKeysCount={groqKeysCount}
      header={
        <ProfileHeader
          stats={{
            tasks: totalTasks,
            agents: totalAgents,
            hours: Math.round(totalHours * 10) / 10,
          }}
        />
      }
    />
  );
}
