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

  return (
    <SettingsContent
      user={user}
      channels={channels}
      preferences={preferences}
      hasGithubToken={hasGithubToken}
      header={<ProfileHeader />}
    />
  );
}
