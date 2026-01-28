import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border py-12 bg-background text-foreground transition-colors">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="font-bold text-lg">DevFlow</div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Open source.
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex flex-col gap-2">
              <span className="font-medium text-sm">Product</span>
              <Link
                href="https://github.com/miracleonyenma/devflow"
                target="_blank"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </Link>
              <Link
                href="https://www.npmjs.com/package/@untools/devflow"
                target="_blank"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                NPM Package
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-medium text-sm">Resources</span>
              <Link
                href="https://github.com/features/copilot/cli"
                target="_blank"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Copilot CLI
              </Link>
              <Link
                href="https://github.com/github/copilot-sdk"
                target="_blank"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Copilot SDK
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
