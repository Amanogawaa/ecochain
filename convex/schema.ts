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
    .index("phone", ["phone"]),
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
  })
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_owner", ["ownerId"]),
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
