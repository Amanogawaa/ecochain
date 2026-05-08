import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("donations").order("desc").collect();
  },
});

export const getById = query({
  args: { id: v.id("donations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    location: v.string(),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    category: v.string(),
    status: v.union(
      v.literal("ready"),
      v.literal("assigned"),
      v.literal("transport"),
      v.literal("scheduled"),
    ),
    coordinator: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const createdAt = Date.now();
    const updatedAt = "Just now";
    const donationId = await ctx.db.insert("donations", {
      ...args,
      createdAt,
      updatedAt,
      ownerId: userId,
    });
    await ctx.db.insert("notifications", {
      userId,
      title: "Listing created",
      body: `Your listing "${args.title}" is now live for the community.`,
      link: `/listings/${donationId}`,
      kind: "listing_created",
      createdAt,
    });
    return donationId;
  },
});
