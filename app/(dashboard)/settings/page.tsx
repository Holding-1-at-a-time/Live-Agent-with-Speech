"use client";

import { useOrganization } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  const { organization: clerkOrganization, isLoaded } = useOrganization();
  const orgId = clerkOrganization?.id;

  const organization = useQuery(
    api.files.organizations.get,
    orgId ? { orgId } : "skip"
  );

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!clerkOrganization) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <h2 className="text-lg font-semibold">No Organization Selected</h2>
        <p className="text-gray-500">
          Please select or create an organization to manage its settings.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Organization Settings</h2>
      <Card>
        <CardHeader>
          <CardTitle>{clerkOrganization.name}</CardTitle>
          <CardDescription>
            View settings and details for your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {organization === undefined && <div>Loading settings...</div>}
          
          {organization === null && (
             <p className="text-sm text-red-500">
                This organization has not been synced to the database yet.
            </p>
          )}

          {organization && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-600">
                  Organization Name
                </h4>
                <p className="text-gray-900">{organization.name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600">
                  Clerk Organization ID
                </h4>
                <p className="text-sm text-gray-700 font-mono bg-gray-100 p-2 rounded w-full overflow-x-auto">
                  {organization.clerkId}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}