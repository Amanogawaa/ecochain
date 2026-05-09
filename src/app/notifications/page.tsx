import { NotificationsInbox } from "@/ui/notifications/NotificationsInbox";
import { MainNav } from "@/ui/navigation/MainNav";

export default function NotificationsPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="eco-backdrop pointer-events-none absolute inset-0 opacity-95" />

      <MainNav variant="app" subtitle="Notifications" />

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 pb-16">
        <section className="grid gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--eco-forest)]/60">
            Notifications
          </p>
          <h1 className="font-[var(--font-display)] text-3xl text-[var(--eco-forest)]">
            Inbox
          </h1>
        </section>
        <NotificationsInbox />
      </main>
    </div>
  );
}
