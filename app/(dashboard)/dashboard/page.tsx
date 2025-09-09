"use client";

import { useOrganization } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Doc } from "../../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";

function CallsTable({ calls }: { calls: Doc<"calls">[] }) {
  const router = useRouter();

  if (calls.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <h2 className="text-lg font-semibold">No calls yet</h2>
        <p className="text-gray-500">
          Calls for this organization will appear here once they are processed.
        </p>
      </div>
    );
  }

  const handleRowClick = (callId: string) => {
    router.push(`/dashboard/calls/${callId}`);
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Caller</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.map((call) => (
            <TableRow 
              key={call._id} 
              onClick={() => handleRowClick(call._id)}
              className="cursor-pointer"
            >
              <TableCell>{call.clientPhoneNumber}</TableCell>
              <TableCell>
                {new Date(call._creationTime).toLocaleString()}
              </TableCell>
              <TableCell>
                 <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    call.status === "completed" ? "bg-green-100 text-green-800" :
                    call.status === "processing" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                 }`}>
                    {call.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function DashboardPage() {
  const { organization } = useOrganization();
  const orgId = organization?.id;

  const calls = useQuery(api.files.calls.list, orgId ? { orgId } : "skip");

  if (!organization) {
    return <div className="text-center p-8">Select or create an organization to get started.</div>;
  }

  if (calls === undefined) {
    return <div>Loading calls...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Call History</h2>
      <CallsTable calls={calls} />
    </div>
  );
}