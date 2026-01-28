import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-100 py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="font-bold text-lg">DevFlow</div>
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} Open source.
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex flex-col gap-2">
              <span className="font-medium text-sm">Product</span>
              <Link
                href="https://github.com/miracleonyenma/devflow"
                target="_blank"
                className="text-sm text-gray-500 hover:text-black"
              >
                GitHub
              </Link>
              <Link
                href="https://www.npmjs.com/package/@untools/devflow"
                target="_blank"
                className="text-sm text-gray-500 hover:text-black"
              >
                NPM Package
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-medium text-sm">Resources</span>
              <Link
                href="https://github.com/features/copilot/cli"
                target="_blank"
                className="text-sm text-gray-500 hover:text-black"
              >
                Copilot CLI
              </Link>
              <Link
                href="https://github.com/github/copilot-sdk"
                target="_blank"
                className="text-sm text-gray-500 hover:text-black"
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
