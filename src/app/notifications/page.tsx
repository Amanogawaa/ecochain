import Link from "next/link";
import { NotificationsInbox } from "@/ui/notifications/NotificationsInbox";

export default function NotificationsPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="eco-backdrop pointer-events-none absolute inset-0 opacity-95" />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--eco-forest)]/60">
            Notifications
          </p>
          <h1 className="mt-2 font-[var(--font-display)] text-3xl text-[var(--eco-forest)]">
            Inbox
          </h1>
        </div>
        <Link
          href="/"
          className="rounded-full border border-[var(--eco-forest)]/20 px-4 py-2 text-sm text-[var(--eco-forest)] transition hover:bg-[var(--eco-mist)]"
        >
          Back to home
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 pb-16">
        <NotificationsInbox />
      </main>
    </div>
  );
}
