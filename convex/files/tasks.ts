import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// Helper to check if a user has access to a specific call's organization
async function checkCallAccess(ctx: any, callId: Id<"calls">): Promise<string | null> {
    const call = await ctx.db.get(callId);
    if (!call) {
        return null; // Call not found
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        return null;
    }

    const user = await ctx.db
        .query('users')
        .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
        .unique();

    if (!user) {
        return null;
    }

    const orgClerkId = call.orgClerkId;
    
    // Check personal workspace or organization membership
    if (orgClerkId === identity.subject || user.orgIds.some(org => org.orgId === orgClerkId)) {
        return orgClerkId;
    }

    return null; // No access
}


export const listByCall = query({
    args: { callId: v.id("calls") },
    handler: async (ctx, args) => {
        const hasAccess = await checkCallAccess(ctx, args.callId);
        if (!hasAccess) {
            // Return empty array if user doesn't have access, to not leak information.
            return [];
        }

        return await ctx.db
            .query("tasks")
            .withIndex("by_call_id", (q) => q.eq("callId", args.callId))
            .order("desc")
            .collect();
    }
});


export const create = mutation({
    args: {
        callId: v.id("calls"),
        description: v.string(),
        dueDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const orgClerkId = await checkCallAccess(ctx, args.callId);
        if (!orgClerkId) {
            throw new Error("You do not have permission to create tasks for this call.");
        }

        const taskId = await ctx.db.insert("tasks", {
            orgClerkId,
            callId: args.callId,
            description: args.description,
            dueDate: args.dueDate,
            status: "pending",
        });

        return taskId;
    }
});

export const updateStatus = mutation({
    args: {
        taskId: v.id("tasks"),
        status: v.union(v.literal("pending"), v.literal("completed")),
    },
    handler: async (ctx, args) => {
        const task = await ctx.db.get(args.taskId);
        if (!task) {
            throw new Error("Task not found");
        }
        
        const hasAccess = await checkCallAccess(ctx, task.callId);
        if (!hasAccess) {
            throw new Error("You do not have permission to update this task.");
        }

        await ctx.db.patch(args.taskId, { status: args.status });
    }
});