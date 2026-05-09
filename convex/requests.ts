import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const requests = await ctx.db.query("requests").order("desc").collect();

    return await Promise.all(
      requests.map(async (request) => {
        const requester = await ctx.db.get(request.requesterId);
        return {
          ...request,
          requester: requester
            ? {
                id: requester._id,
                name: requester.name,
                email: requester.email,
              }
            : null,
        };
      }),
    );
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    const requests = await ctx.db
      .query("requests")
      .withIndex("by_requester", (q) => q.eq("requesterId", userId))
      .order("desc")
      .collect();

    return await Promise.all(
      requests.map(async (request) => {
        const requester = await ctx.db.get(request.requesterId);
        return {
          ...request,
          requester: requester
            ? {
                id: requester._id,
                name: requester.name,
                email: requester.email,
              }
            : null,
        };
      }),
    );
  },
});

export const getById = query({
  args: { id: v.id("requests") },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.id);
    if (!request) {
      return null;
    }

    const requester = await ctx.db.get(request.requesterId);
    return {
      ...request,
      requester: requester
        ? {
            id: requester._id,
            name: requester.name,
            email: requester.email,
          }
        : null,
    };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    location: v.string(),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    category: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("requests", {
      ...args,
      status: "pending",
      requesterId: userId,
      createdAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("requests"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("fulfilled"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const request = await ctx.db.get(args.id);
    if (!request) {
      throw new Error("Request not found");
    }

    const user = await ctx.db.get(userId);
    const isVerifier = user?.role === "verifier";
    const isRequester = request.requesterId === userId;

    if (args.status === "approved" || args.status === "fulfilled") {
      if (!isVerifier) {
        throw new Error("Only verifiers can approve requests");
      }
    }

    if (args.status === "cancelled" && !isRequester && !isVerifier) {
      throw new Error("Not authorized");
    }

    if (args.status === "fulfilled" && !request.fulfilledByDonationId) {
      throw new Error("A matching donation must fulfill this request first");
    }

    await ctx.db.patch(args.id, { status: args.status });

    await ctx.db.insert("notifications", {
      userId: request.requesterId,
      title: "Request updated",
      body: `Your request "${request.title}" is now ${args.status}.`,
      link: "/requests",
      kind: "request_updated",
      createdAt: Date.now(),
    });

    return args.id;
  },
});
