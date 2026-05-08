"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

export function AuthStatus() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const me = useQuery(api.users.me);
  const ensureRole = useMutation(api.users.ensureRole);

  useEffect(() => {
    if (isAuthenticated && me && !me.role) {
      void ensureRole({ role: "user" });
    }
  }, [isAuthenticated, me, ensureRole]);

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

  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="text-[var(--eco-forest)]/70">
        {me?.name ?? me?.email ?? "Signed in"}
      </span>
      <button
        onClick={() => void signOut()}
        className="rounded-full border border-[var(--eco-forest)]/20 px-3 py-1 text-[var(--eco-forest)] transition hover:bg-[var(--eco-mist)]"
      >
        Sign out
      </button>
    </div>
  );
}
