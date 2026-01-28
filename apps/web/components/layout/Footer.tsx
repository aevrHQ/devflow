import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-100 py-12">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-sm text-gray-500">
          © {new Date().getFullYear()} DevFlow. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <Link href="#" className="text-sm text-gray-500 hover:text-black">
            Privacy
          </Link>
          <Link href="#" className="text-sm text-gray-500 hover:text-black">
            Terms
          </Link>
          <Link href="#" className="text-sm text-gray-500 hover:text-black">
            Twitter
          </Link>
        </div>
      </div>
    </footer>
  );
}
