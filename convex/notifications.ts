import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listForUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return 0;
    }
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", userId).eq("readAt", undefined),
      )
      .collect();
    return unread.length;
  },
});

export const markRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const notification = await ctx.db.get(args.id);
    if (!notification || notification.userId !== userId) {
      throw new Error("Notification not found");
    }
    await ctx.db.patch(args.id, { readAt: Date.now() });
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    link: v.optional(v.string()),
    kind: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    await ctx.db.insert("notifications", {
      ...args,
      userId,
      createdAt: Date.now(),
    });
  },
});
