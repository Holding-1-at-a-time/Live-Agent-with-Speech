import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// Helper function to check user organization membership
async function checkMembership(ctx: any, orgClerkId: string): Promise<boolean> {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        return false;
    }

    const user = await ctx.db
        .query('users')
        .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
        .unique();

    if (!user) {
        return false;
    }

    // User's personal workspace has orgId equal to their clerkId
    if (orgClerkId === identity.subject) {
        return true;
    }

    return user.orgIds.some(org => org.orgId === orgClerkId);
}

export const list = query({
    args: { orgId: v.string() },
    handler: async (ctx, args) => {
        const hasAccess = await checkMembership(ctx, args.orgId);
        if (!hasAccess) {
            return [];
        }

        return await ctx.db
            .query("clients")
            .withIndex("by_org_clerk_id_and_phone", q => q.eq("orgClerkId", args.orgId))
            .order("desc")
            .collect();
    }
});

export const create = mutation({
    args: {
        orgId: v.string(),
        name: v.string(),
        phoneNumber: v.string(),
    },
    handler: async (ctx, args) => {
        const hasAccess = await checkMembership(ctx, args.orgId);
        if (!hasAccess) {
            throw new Error("You do not have permission to create clients for this organization.");
        }

        const clientId = await ctx.db.insert("clients", {
            orgClerkId: args.orgId,
            name: args.name,
            phoneNumber: args.phoneNumber,
        });

        return clientId;
    }
});