import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  organizations: defineTable({
    clerkId: v.string(),
    name: v.string(),
  }).index("by_clerk_id", ["clerkId"]),

  users: defineTable({
    clerkId: v.string(),
    orgIds: v.array(v.object({
      orgId: v.string(),
      role: v.union(v.literal("admin"), v.literal("member")),
    })),
  }).index("by_clerk_id", ["clerkId"]),

  calls: defineTable({
    orgClerkId: v.string(),
    clientPhoneNumber: v.string(),
    status: v.union(
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    audioFileId: v.optional(v.id("_storage")),
    transcript: v.optional(v.string()),
    summary: v.optional(v.string()),
    // structuredData is set to v.any() as a placeholder per the prompt.
    // In a real application, this should be a v.object with a defined schema.
    structuredData: v.optional(v.any()),
  }).index("by_org_clerk_id", ["orgClerkId"]),

  clients: defineTable({
    orgClerkId: v.string(),
    name: v.string(),
    phoneNumber: v.string(),
  }).index("by_org_clerk_id_and_phone", ["orgClerkId", "phoneNumber"]),

  bookings: defineTable({
    orgClerkId: v.string(),
    clientId: v.id("clients"),
    callId: v.id("calls"),
    service: v.string(),
    appointmentDate: v.number(), // Unix timestamp
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("completed")
    ),
  }).index("by_org_clerk_id", ["orgClerkId"]),

  tasks: defineTable({
    orgClerkId: v.string(),
    callId: v.id("calls"),
    description: v.string(),
    dueDate: v.optional(v.number()), // Unix timestamp
    status: v.union(v.literal("pending"), v.literal("completed")),
  }).index("by_call_id", ["callId"]),
});