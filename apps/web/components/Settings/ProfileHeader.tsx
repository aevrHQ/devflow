import { getCurrentUser } from "@/lib/auth";

export default async function ProfileHeader({
  stats,
}: {
  stats?: { tasks: number; agents: number; hours: number };
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="flex flex-col items-center justify-center py-6 mb-6">
      <div className="w-24 h-24 rounded-full bg-linear-to-br from-gray-200 to-gray-300 dark:from-neutral-800 dark:to-neutral-700 mb-4 flex items-center justify-center shadow-inner">
        {/* Placeholder for Avatar */}
        <span className="text-3xl font-medium text-muted-foreground">
          {user.email?.[0].toUpperCase()}
        </span>
      </div>
      <h2 className="text-xl font-bold text-foreground mb-1">
        {user.email?.split("@")[0]}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">{user.email}</p>

      <div className="flex items-center justify-center gap-12 w-full text-center">
        <div>
          <div className="font-bold text-lg text-foreground">
            {stats?.tasks || 0}
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            Tasks
          </div>
        </div>
        <div>
          <div className="font-bold text-lg text-foreground">
            {stats?.agents || 0}
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            Agents
          </div>
        </div>
        <div>
          <div className="font-bold text-lg text-foreground">
            {stats?.hours || 0}
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            Hours
          </div>
        </div>
      </div>
    </div>
  );
}
