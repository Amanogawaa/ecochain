"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { User } from "lucide-react";

export function AuthStatus() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const me = useQuery(api.users.me);
  const ensureRole = useMutation(api.users.ensureRole);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isAuthenticated && me && !me.role) {
      void ensureRole({ role: "user" });
    }
  }, [isAuthenticated, me, ensureRole]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  if (isLoading) {
    return (
      <span className="text-xs text-[var(--eco-forest)]/60">Loading...</span>
    );
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/auth"
        className="rounded-full border border-[var(--eco-forest)]/20 px-4 py-2 text-xs font-semibold text-[var(--eco-forest)] transition hover:bg-[var(--eco-mist)]"
      >
        Sign in
      </Link>
    );
  }

  const displayName = me?.name ?? me?.email ?? "Signed in";

  return (
    <div ref={containerRef} className="relative z-50">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative z-50 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--eco-forest)]/20 text-[var(--eco-forest)] transition hover:bg-[var(--eco-mist)]"
      >
        <User className="h-4 w-4" />
      </button>
      {isOpen ? (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-[var(--eco-sand)] bg-white/95 p-2 shadow-lg">
          <div className="px-3 py-2 text-[11px] text-[var(--eco-forest)]/70">
            Signed in as
            <div className="mt-1 truncate text-xs text-[var(--eco-forest)]">
              {displayName}
            </div>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="w-full rounded-xl border border-[var(--eco-forest)]/20 px-3 py-2 text-left text-xs text-[var(--eco-forest)] transition hover:bg-[var(--eco-mist)]"
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
