import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});

export const ensureRole = mutation({
  args: { role: v.union(v.literal("user"), v.literal("verifier")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    if (user.role) {
      return user.role;
    }
    await ctx.db.patch(userId, { role: args.role });
    return args.role;
  },
});
