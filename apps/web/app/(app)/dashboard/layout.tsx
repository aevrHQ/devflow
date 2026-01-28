import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardNav from "@/components/DashboardNav";
import MobileBottomNav from "@/components/MobileBottomNav";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 flex flex-col">
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

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8 text-foreground">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
