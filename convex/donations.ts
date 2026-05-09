import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const enrichDonation = async (ctx: any, donation: any) => {
  if (!donation.requestId) {
    return {
      ...donation,
      request: null,
    };
  }

  const request = await ctx.db.get(donation.requestId);
  if (!request) {
    return {
      ...donation,
      request: null,
    };
  }

  const requester = await ctx.db.get(request.requesterId);
  return {
    ...donation,
    request: {
      id: request._id,
      title: request.title,
      requester: requester
        ? {
            id: requester._id,
            name: requester.name,
            email: requester.email,
          }
        : null,
    },
  };
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const donations = await ctx.db.query("donations").order("desc").collect();

    return await Promise.all(
      donations.map(async (donation) => enrichDonation(ctx, donation)),
    );
  },
});

export const getById = query({
  args: { id: v.id("donations") },
  handler: async (ctx, args) => {
    const donation = await ctx.db.get(args.id);
    if (!donation) {
      return null;
    }

    return await enrichDonation(ctx, donation);
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
    requestId: v.optional(v.id("requests")),
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

    if (args.requestId) {
      const request = await ctx.db.get(args.requestId);
      if (!request) {
        throw new Error("Request not found");
      }
      if (request.status !== "approved") {
        throw new Error("Only approved requests can be fulfilled");
      }

      await ctx.db.patch(args.requestId, {
        status: "fulfilled",
        fulfilledByDonationId: donationId,
      });

      await ctx.db.insert("notifications", {
        userId: request.requesterId,
        title: "Donation on the way",
        body: `Someone created a donation for your request "${request.title}".`,
        link: `/listings/${donationId}`,
        kind: "request_fulfilled",
        createdAt,
      });
    }

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
