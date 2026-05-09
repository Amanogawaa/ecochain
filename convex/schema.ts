import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(v.union(v.literal("user"), v.literal("verifier"))),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("by_role", ["role"]),
  donations: defineTable({
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
    updatedAt: v.string(),
    createdAt: v.number(),
    ownerId: v.optional(v.id("users")),
    requestId: v.optional(v.id("requests")),
  })
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_owner", ["ownerId"]),
  claims: defineTable({
    listingId: v.id("donations"),
    claimantId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("fulfilled"),
      v.literal("cancelled"),
    ),
    ownerConfirmedAt: v.optional(v.number()),
    claimantConfirmedAt: v.optional(v.number()),
    ownerConfirmLocation: v.optional(
      v.object({
        latitude: v.number(),
        longitude: v.number(),
      }),
    ),
    claimantConfirmLocation: v.optional(
      v.object({
        latitude: v.number(),
        longitude: v.number(),
      }),
    ),
    needsReview: v.optional(v.boolean()),
    reviewStatus: v.optional(
      v.union(v.literal("verified"), v.literal("rejected")),
    ),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.id("users")),
    createdAt: v.number(),
    // Blockchain proof fields
    txHash: v.optional(v.string()),
    chainId: v.optional(v.number()),
    blockNumber: v.optional(v.number()),
    verifiedAtOnChain: v.optional(v.number()),
  })
    .index("by_listing", ["listingId"])
    .index("by_claimant", ["claimantId"])
    .index("by_listing_claimant", ["listingId", "claimantId"])
    .index("by_needs_review", ["needsReview"]),
  requests: defineTable({
    title: v.string(),
    location: v.string(),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    category: v.string(),
    details: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("fulfilled"),
      v.literal("cancelled"),
    ),
    fulfilledByDonationId: v.optional(v.id("donations")),
    requesterId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_requester", ["requesterId"])
    .index("by_status", ["status"]),
  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
    link: v.optional(v.string()),
    kind: v.string(),
    createdAt: v.number(),
    readAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "readAt"]),
});
