"use client";

import Link from "next/link";
import { useConvexAuth } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { AuthStatus } from "@/ui/auth/AuthStatus";
import { NotificationsDropdown } from "@/ui/notifications/NotificationsDropdown";
import { Plus } from "lucide-react";

type MainNavProps = {
  variant?: "landing" | "app";
  subtitle?: string;
};

export function MainNav({ variant = "app", subtitle }: MainNavProps) {
  const { isAuthenticated } = useConvexAuth();
  const me = useQuery(api.users.me);
  const isVerifier = me?.role === "verifier";

  const appLinks = isVerifier
    ? [
        { label: "Dashboard", href: "/verifications" },
        { label: "Listings", href: "/listings" },
        { label: "Requests", href: "/requests" },
        { label: "Map", href: "/map" },
      ]
    : [
        { label: "Map", href: "/map" },
        { label: "Requests", href: "/requests" },
        { label: "Listings", href: "/listings" },
      ];

  const landingLinks = [
    { label: "Map", href: "/map" },
    { label: "Requests", href: "/requests" },
    { label: "Listings", href: "/listings" },
  ];

  const links = variant === "landing" && !isVerifier ? landingLinks : appLinks;

  const brandHref = isVerifier ? "/verifications" : "/";

  return (
    <header className="relative z-40 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
      <Link href={brandHref} className="flex items-center gap-3">
        <div className="flex flex-col leading-tight">
          <span className="text-sm uppercase tracking-[0.2em] text-[var(--eco-moss)]">
            EcoChain
          </span>
          <span className="text-xs text-[var(--eco-forest)]/70">
            {subtitle ?? (isVerifier ? "Verifier desk" : "Community")}
          </span>
        </div>
      </Link>
      <nav className="hidden items-center gap-6 text-sm text-[var(--eco-forest)]/80 md:flex">
        {links.map((link) =>
          link.href.startsWith("#") ? (
            <a
              key={link.label}
              href={link.href}
              className="transition hover:text-[var(--eco-forest)]"
            >
              {link.label}
            </a>
          ) : (
            <Link
              key={link.label}
              href={link.href}
              className="transition hover:text-[var(--eco-forest)]"
            >
              {link.label}
            </Link>
          ),
        )}
      </nav>
      <div className="flex items-center gap-3">
        {!isVerifier && variant !== "landing" ? (
          <Link
            href="/listings/new"
            className="relative z-50 flex h-9 w-9 group bg-[var(--eco-forest)] items-center justify-center rounded-full border border-[var(--eco-forest)]/20 text-[var(--eco-forest)] transition hover:bg-[var(--eco-mist)]"
          >
            <Plus className="h-4 w-4 text-white group-hover:text-[var(--eco-forest)]" />
          </Link>
        ) : null}
        {!isVerifier && variant === "landing" ? (
          <Link
            href="/listings/new"
            className="relative z-50 flex h-9 w-9 group bg-[var(--eco-forest)] items-center justify-center rounded-full border border-[var(--eco-forest)]/20 text-[var(--eco-forest)] transition hover:bg-[var(--eco-mist)]"
          >
            <Plus className="h-4 w-4 text-white group-hover:text-[var(--eco-forest)]" />
          </Link>
        ) : null}
        {isAuthenticated ? <NotificationsDropdown /> : null}
        <AuthStatus />
      </div>
    </header>
  );
}
