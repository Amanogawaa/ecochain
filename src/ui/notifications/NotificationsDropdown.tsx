"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { useConvexAuth } from "@convex-dev/auth/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Bell } from "lucide-react";

export function NotificationsDropdown() {
  const { isAuthenticated } = useConvexAuth();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const unreadCount = useQuery(api.notifications.unreadCount) ?? 0;
  const notifications = useQuery(api.notifications.listForUser) ?? [];
  const markRead = useMutation(api.notifications.markRead);

  const visibleNotifications = useMemo(
    () => notifications.slice(0, 5),
    [notifications],
  );

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

  const handleMarkRead = (id: Id<"notifications">, isRead?: number | null) => {
    if (isRead) {
      return;
    }
    void markRead({ id });
  };

  return (
    <div className="relative z-50" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative z-50 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--eco-forest)]/20 text-[var(--eco-forest)] transition hover:bg-[var(--eco-mist)]"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--eco-rust)] px-1 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-50 mt-3 w-80 rounded-2xl border border-[var(--eco-sand)] bg-white/95 p-3 shadow-lg">
          <div className="flex items-center justify-between px-2 pb-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--eco-forest)]/60">
              Notifications
            </p>
            <Link
              href="/notifications"
              className="text-xs font-semibold text-[var(--eco-moss)]"
              onClick={() => setIsOpen(false)}
            >
              View all
            </Link>
          </div>
          {!isAuthenticated ? (
            <div className="rounded-2xl border border-[var(--eco-sand)] bg-[var(--eco-mist)] p-3 text-xs text-[var(--eco-forest)]/70">
              Sign in to see notifications.
            </div>
          ) : visibleNotifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--eco-sand)] p-3 text-xs text-[var(--eco-forest)]/70">
              You have no notifications yet.
            </div>
          ) : (
            <div className="grid gap-2">
              {visibleNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`rounded-2xl border px-3 py-2 text-xs transition ${
                    notification.readAt
                      ? "border-[var(--eco-sand)] bg-white/70 text-[var(--eco-forest)]/70"
                      : "border-[var(--eco-moss)]/40 bg-[var(--eco-mist)] text-[var(--eco-forest)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{notification.title}</p>
                    <span className="text-[10px] text-[var(--eco-forest)]/60">
                      {new Date(notification.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--eco-forest)]/70">
                    {notification.body}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    {notification.link ? (
                      <Link
                        href={notification.link}
                        className="text-[11px] font-semibold text-[var(--eco-moss)]"
                        onClick={() => {
                          handleMarkRead(
                            notification._id,
                            notification.readAt ?? null,
                          );
                          setIsOpen(false);
                        }}
                      >
                        View →
                      </Link>
                    ) : (
                      <span />
                    )}
                    {!notification.readAt ? (
                      <button
                        type="button"
                        onClick={() =>
                          handleMarkRead(
                            notification._id,
                            notification.readAt ?? null,
                          )
                        }
                        className="rounded-full border border-[var(--eco-forest)]/20 px-2 py-1 text-[10px] text-[var(--eco-forest)]"
                      >
                        Mark read
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
