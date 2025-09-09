import { internalMutation, mutation } from "../_generated/server";
import { v } from "convex/values";

export const getOrCreate = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called getOrCreateUser without authentication present");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) =>
        q.eq("clerkId", identity.subject)
      )
      .unique();

    if (user !== null) {
      return user._id;
    }

    const newUser = await ctx.db.insert("users", {
      clerkId: identity.subject,
      orgIds: [],
    });

    return newUser;
  },
});

// Note: In a production app, you'd likely use Clerk webhooks
// and internalMutations to sync user data for better security and reliability.
// For example, syncing organization memberships.
