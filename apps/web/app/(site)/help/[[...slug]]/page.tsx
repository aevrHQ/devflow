import { parseMarkdown } from "@/lib/markdown";
import fs from "fs/promises";
import path from "path";
import Link from "next/link";

interface HelpPageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

const guides = [
  {
    slug: "getting-started",
    title: "Getting Started",
    description: "Set up your first notification channel in 5 minutes",
    icon: "🚀",
  },
  {
    slug: "filtering",
    title: "Webhook Filtering",
    description: "Control which events trigger notifications",
    icon: "🎯",
  },
  {
    slug: "telegram-groups",
    title: "Telegram Group Chats",
    description: "Connect team group chats for collaboration",
    icon: "👥",
  },
  {
    slug: "sources",
    title: "Webhook Sources",
    description: "Connect GitHub, Render, Vercel, and more",
    icon: "🔗",
  },
  {
    slug: "render",
    title: "Render Integration",
    description: "Setup guide for Render deployments",
    icon: "☁️",
  },
  {
    slug: "agents",
    title: "Connected Agents",
    description: "Learn how to connect and manage local DevFlow agents",
    icon: "⚡️",
    // Note: The icon property expects a string (emoji) in this specific implementation based on the file content seen.
    // Wait, the file uses emojis as strings. "zap" in lucide is an icon component, but here it renders as text {guide.icon}
    // So I should use an emoji like ⚡️
  },
];

export default async function HelpPage({ params }: HelpPageProps) {
  const { slug: slugArray } = await params;
  const slug = slugArray?.[0];

  // If no slug, show help index
  if (!slug) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 text-foreground">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold tracking-tight mb-4 text-foreground">
              Help Center
            </h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to master your notification hub
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {guides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/help/${guide.slug}`}
                className="group bg-card rounded-2xl p-8 border border-border hover:border-foreground transition-all hover:"
              >
                <div className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all">
                  {guide.icon}
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {guide.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {guide.description}
                </p>
                <div className="text-foreground font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                  Read guide
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          <div className="bg-muted rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              Quick Links
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="text-xl">⚙️</span>
                <span className="font-medium">Settings Dashboard</span>
              </Link>
              <a
                href="https://github.com/yourrepo/pinga"
                className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="text-xl">🐛</span>
                <span className="font-medium">Report an Issue</span>
              </a>
              <a
                href="https://t.me/pingacommunity"
                className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="text-xl">💬</span>
                <span className="font-medium">Join Community</span>
              </a>
              <a
                href="mailto:support@pinga.app"
                className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="text-xl">📧</span>
                <span className="font-medium">Email Support</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Load markdown content
  let html: string;
  let contentError = false;

  try {
    const contentPath = path.join(process.cwd(), "content", `${slug}.md`);
    const content = await fs.readFile(contentPath, "utf-8");
    html = await parseMarkdown(content);
  } catch {
    contentError = true;
  }

  // Handle error case
  if (contentError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center px-4">
          <h1 className="text-4xl font-bold mb-4">Guide Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The guide you&apos;re looking for doesn&apos;t exist yet.
          </p>
          <Link
            href="/help"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-colors"
          >
            Back to Help Center
          </Link>
        </div>
      </div>
    );
  }

  const guide = guides.find((g) => g.slug === slug);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}

      <div className="bg-muted/30 py-16 px-4 border-b border-border -mt-16">
        <div className="max-w-3xl mx-auto text-center">
          {guide && (
            <>
              <div className="text-5xl mb-6 grayscale hover:grayscale-0 transition-all cursor-default inline-block">
                {guide.icon}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
                {guide.title}
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg mx-auto">
                {guide.description}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto py-16 px-6">
        <article
          className="prose prose-lg prose-gray dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
            prose-h1:text-4xl prose-h1:mb-6
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-muted-foreground prose-p:leading-relaxed
            prose-a:text-foreground prose-a:underline hover:prose-a:text-muted-foreground
            prose-strong:text-foreground prose-strong:font-semibold
            prose-pre:bg-zinc-900 prose-pre:text-zinc-100 prose-pre:rounded-2xl prose-pre:
            prose-blockquote:border-l-2 prose-blockquote:border-foreground prose-blockquote:bg-muted prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:rounded-r-lg
            prose-ul:list-disc prose-ul:pl-0 prose-ul:space-y-2
            prose-li:text-muted-foreground prose-li:pl-2
            prose-img:rounded-2xl prose-img: prose-img:border prose-img:border-border
            "
          dangerouslySetInnerHTML={{ __html: html! }}
        />
      </div>

      {/* Footer Navigation */}
      <div className="max-w-5xl mx-auto px-6 py-16 border-t border-border">
        <h3 className="text-lg font-bold mb-6 text-foreground">More Guides</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {guides
            .filter((g) => g.slug !== slug)
            .slice(0, 3)
            .map((guide) => (
              <Link
                key={guide.slug}
                href={`/help/${guide.slug}`}
                className="group p-6 border border-border rounded-2xl hover:border-foreground transition-all"
              >
                <div className="text-3xl mb-3 grayscale group-hover:grayscale-0 transition-all">
                  {guide.icon}
                </div>
                <h4 className="font-bold text-foreground mb-1 group-hover:underline decoration-1 underline-offset-4">
                  {guide.title}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {guide.description}
                </p>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
