import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-5">
        <Logo />
        <ThemeToggle />
      </header>

      <main
        id="main"
        className="flex flex-1 items-center justify-center px-6 py-10"
      >
        <div className="w-full max-w-104">{children}</div>
      </main>

      <footer className="text-muted-foreground px-6 py-6 text-center text-xs">
        <Link href="/" className="hover:text-foreground transition-colors">
          ← Back to waverify.dev
        </Link>
      </footer>
    </div>
  );
}
