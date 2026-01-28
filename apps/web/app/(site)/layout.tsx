import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-accent selection:text-accent-foreground">
      <Navbar />
      <main className="flex-1 pt-32 pb-20">{children}</main>
      <Footer />
    </div>
  );
}
