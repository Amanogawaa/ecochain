"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";

export default function AuthPage() {
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [role, setRole] = useState<"user" | "verifier">("user");
  const [error, setError] = useState<string | null>(null);

  const handlePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    formData.set("flow", flow);

    try {
      await signIn("password", formData);
    } catch (e) {
      setError("Unable to sign in. Please check your credentials.");
    }
  };

  const handleGoogle = async () => {
    setError(null);
    const result = await signIn("google");
    if (result.redirect) {
      window.location.href = result.redirect.toString();
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="eco-backdrop pointer-events-none absolute inset-0 opacity-95" />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--eco-forest)]/60">
            Welcome back
          </p>
          <h1 className="mt-2 font-[var(--font-display)] text-3xl text-[var(--eco-forest)]">
            Sign in to EcoChain
          </h1>
        </div>
        <Link
          href="/"
          className="rounded-full border border-[var(--eco-forest)]/20 px-4 py-2 text-sm text-[var(--eco-forest)] transition hover:bg-[var(--eco-mist)]"
        >
          Back to home
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 pb-16">
        <div className="rounded-[32px] border border-[var(--eco-sand)] bg-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--eco-forest)]/70">
              {flow === "signIn" ? "Sign in" : "Create account"}
            </span>
            <button
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              className="text-[var(--eco-moss)]"
            >
              {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
            </button>
          </div>
          {isAuthenticated ? (
            <p className="mt-6 text-sm text-[var(--eco-forest)]/70">
              You are already signed in.
            </p>
          ) : (
            <form onSubmit={handlePassword} className="mt-6 grid gap-4">
              <input
                name="email"
                type="email"
                placeholder="Email"
                className="rounded-2xl border border-[var(--eco-sand)] bg-white/80 px-4 py-3 text-sm text-[var(--eco-forest)] outline-none focus:border-[var(--eco-moss)]"
              />
              {flow === "signUp" ? (
                <input
                  name="name"
                  type="text"
                  placeholder="Full name"
                  className="rounded-2xl border border-[var(--eco-sand)] bg-white/80 px-4 py-3 text-sm text-[var(--eco-forest)] outline-none focus:border-[var(--eco-moss)]"
                />
              ) : null}
              <input
                name="password"
                type="password"
                placeholder="Password"
                className="rounded-2xl border border-[var(--eco-sand)] bg-white/80 px-4 py-3 text-sm text-[var(--eco-forest)] outline-none focus:border-[var(--eco-moss)]"
              />
              {flow === "signUp" ? (
                <label className="grid gap-2 text-xs text-[var(--eco-forest)]/70">
                  Role
                  <select
                    name="role"
                    value={role}
                    onChange={(event) =>
                      setRole(event.target.value as "user" | "verifier")
                    }
                    className="rounded-2xl border border-[var(--eco-sand)] bg-white/80 px-4 py-3 text-sm text-[var(--eco-forest)] outline-none focus:border-[var(--eco-moss)]"
                  >
                    <option value="user">Community member</option>
                    <option value="verifier">Verifier</option>
                  </select>
                </label>
              ) : null}
              <button
                type="submit"
                className="rounded-full bg-[var(--eco-moss)] px-4 py-3 text-sm font-semibold text-[var(--eco-base)]"
              >
                {flow === "signIn" ? "Sign in" : "Create account"}
              </button>
            </form>
          )}
          <div className="mt-6 border-t border-[var(--eco-sand)]/70 pt-4">
            <button
              onClick={() => void handleGoogle()}
              className="w-full rounded-full border border-[var(--eco-forest)]/20 px-4 py-3 text-sm font-semibold text-[var(--eco-forest)] transition hover:bg-[var(--eco-mist)]"
            >
              Continue with Google
            </button>
          </div>
          {error ? (
            <p className="mt-4 text-xs text-[var(--eco-rust)]">{error}</p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
