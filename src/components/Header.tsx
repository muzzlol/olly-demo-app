import { Link } from "@tanstack/react-router";

import HealthDot from "./HealthDot";

export default function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 border-b border-border/40 bg-background/60 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
            o
          </span>
          <span className="text-sm font-semibold tracking-tight">olly</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <HealthDot />
          <a
            href="https://github.com/muzzlol/olly"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            github
          </a>
        </nav>
      </div>
    </header>
  );
}
