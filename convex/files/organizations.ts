import { query } from "../_generated/server";
import { v } from "convex/values";
import { Doc } from "../_generated/dataModel";

// Helper function to check user organization membership.
// In a larger application, this could be refactored into a shared utility file.
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

    // A user is a member if the orgId is in their list of orgs.
    // Settings are strictly for organizations, not personal workspaces.
    return user.orgIds.some(org => org.orgId === orgClerkId);
}

export const get = query({
    args: { orgId: v.string() },
    handler: async (ctx, args): Promise<Doc<"organizations"> | null> => {
        const hasAccess = await checkMembership(ctx, args.orgId);

        if (!hasAccess) {
            // This is an unauthorized access attempt. The frontend should only call
            // this if an organization is active in the user's session.
            throw new Error("You do not have permission to view this organization's settings.");
        }
        
        // This query assumes that your `organizations` table is kept in sync with Clerk.
        // In a production app, you would use Clerk webhooks to listen for `organization.created`
        // and `organization.updated` events to create and update records in this table.
        const organization = await ctx.db
            .query("organizations")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.orgId))
            .unique();

        return organization;
    }
});