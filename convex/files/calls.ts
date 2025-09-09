import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "../_generated/dataModel";

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

// Helper to check if a user has access to a specific call's organization
async function checkCallAccess(ctx: any, callId: Id<"calls">): Promise<boolean> {
    const call = await ctx.db.get(callId);
    if (!call) {
        return false; // Call not found
    }
    return await checkMembership(ctx, call.orgClerkId);
}


export const list = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to view calls.");
    }
    
    const hasAccess = await checkMembership(ctx, args.orgId);

    if (!hasAccess) {
        return [];
    }

    return await ctx.db
      .query("calls")
      .withIndex("by_org_clerk_id", (q) => q.eq("orgClerkId", args.orgId))
      .order("desc")
      .collect();
  },
});

export const get = query({
    args: { callId: v.id("calls") },
    handler: async (ctx, args): Promise<Doc<"calls"> | null> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("You must be logged in to view a call.");
        }

        const call = await ctx.db.get(args.callId);

        if (!call) {
            return null;
        }

        const hasAccess = await checkMembership(ctx, call.orgClerkId);

        if (!hasAccess) {
            throw new Error("You do not have permission to view this call.");
        }

        return call;
    }
});

export const generateSummary = mutation({
    args: { callId: v.id("calls") },
    handler: async (ctx, args) => {
        const hasAccess = await checkCallAccess(ctx, args.callId);
        if (!hasAccess) {
            throw new Error("You do not have permission to modify this call.");
        }

        const call = await ctx.db.get(args.callId);
        if (!call || !call.transcript) {
            throw new Error("Call or transcript not found.");
        }

        // Simulate a call to an external AI service
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

        const simulatedSummary = `This is a simulated AI-generated summary for the call with ${call.clientPhoneNumber}. The transcript was analyzed to extract key points. The client discussed booking a full-detail service for their sedan and asked about pricing and availability for next Tuesday.`;

        await ctx.db.patch(args.callId, { summary: simulatedSummary });

        return simulatedSummary;
    }
});