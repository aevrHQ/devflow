import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardNav from "@/components/DashboardNav";
import MobileBottomNav from "@/components/MobileBottomNav";
import { ThemeToggle } from "@/components/theme-toggle";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import DevflowLogo from "@/components/Icon/DevflowLogo";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await connectToDatabase();
  const dbUser = await User.findById(user.userId).select("featureFlags");
  const useSidebar = dbUser?.featureFlags?.sidebarNavigation || false;

  if (useSidebar) {
    return (
      <SidebarProvider>
        <AppSidebar
          user={{
            name: user.email?.split("@")[0] || "User",
            email: user.email || "",
            avatar: "", // Avatar not in user object yet, maybe use placeholder? NavUser handles fallback.
          }}
        />
        <div className="flex flex-col flex-1 min-h-screen transition-all duration-300 ease-in-out bg-background">
          <header className="flex min-h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 z-10 bg-background/80 backdrop-blur-md">
            {/* Desktop Sidebar Trigger */}
            <SidebarTrigger className="-ml-1 hidden md:flex" />

            {/* Mobile Logo */}
            <div className="md:hidden flex items-center gap-2 mr-auto">
              <DevflowLogo className="w-8 h-8" />
              <span className="font-bold text-lg tracking-tight">Devflow</span>
            </div>

            <div className="mr-auto separator hidden md:block w-[1px] h-4 bg-border mx-2" />
            <div className="flex items-center gap-4 ml-auto">
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-6xl mx-auto pb-32 w-full">
            {children}
          </main>
        </div>
        <MobileBottomNav />
      </SidebarProvider>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 dark:bg-background flex flex-col">
      <header className="bg-background border-b border-border sticky top-0 z-10 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className="font-bold text-xl tracking-tight"
            >
              Devflow
            </Link>
            <DashboardNav />
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              {user.email}
            </span>
            <form
              action={async () => {
                "use server";
                const { cookies } = await import("next/headers");
                (await cookies()).delete("token");
                redirect("/login");
              }}
            >
              <button
                type="submit"
                className="text-sm cursor-pointer font-medium text-destructive hover:text-red-700 dark:hover:text-red-500 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 md:pb-8 text-foreground">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
