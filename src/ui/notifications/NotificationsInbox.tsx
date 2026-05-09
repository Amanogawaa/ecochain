"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { useConvexAuth } from "@convex-dev/auth/react";
import { api } from "@/../convex/_generated/api";

export function NotificationsInbox() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const notifications = useQuery(api.notifications.listForUser) ?? [];
  const markRead = useMutation(api.notifications.markRead);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--eco-sand)] bg-white/80 p-4 text-sm text-[var(--eco-forest)]/70">
        Loading notifications...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-[var(--eco-sand)]  bg-white/80 p-4 text-sm text-[var(--eco-forest)]/70">
        <p>Sign in to view your notifications.</p>
        <Link
          href="/auth"
          className="text-xs font-semibold text-[var(--eco-moss)]"
        >
          Go to sign in →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--eco-sand)] p-6 text-sm text-[var(--eco-forest)]/70">
          You have no notifications yet.
        </div>
      ) : (
        notifications.map((notification) => (
          <div
            key={notification._id}
            className={`rounded-2xl border z-50 p-4 text-sm transition ${
              notification.readAt
                ? "border-[var(--eco-sand)] bg-white/70 text-[var(--eco-forest)]/70"
                : "border-[var(--eco-moss)]/40 bg-[var(--eco-mist)] text-[var(--eco-forest)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold">{notification.title}</p>
              <span className="text-xs text-[var(--eco-forest)]/60">
                {new Date(notification.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <p className="mt-2 text-xs text-[var(--eco-forest)]/70">
              {notification.body}
            </p>
            <div className="mt-3 flex items-center justify-between">
              {notification.link ? (
                <Link
                  href={notification.link}
                  className="text-xs font-semibold text-[var(--eco-moss)]"
                >
                  View →
                </Link>
              ) : (
                <span />
              )}
              {!notification.readAt ? (
                <button
                  onClick={() => void markRead({ id: notification._id })}
                  className="rounded-full border border-[var(--eco-forest)]/20 px-3 py-1 text-xs text-[var(--eco-forest)]"
                >
                  Mark read
                </button>
              ) : null}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
