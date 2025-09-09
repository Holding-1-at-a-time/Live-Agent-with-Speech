"use client";

import { useOrganization } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { FormEvent, useState } from "react";
import { api } from "../../../convex/_generated/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function AddClientForm({ orgId }: { orgId: string }) {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const createClient = useMutation(api.files.clients.create);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !phoneNumber) return;

    await createClient({
      orgId,
      name,
      phoneNumber,
    });
    setName("");
    setPhoneNumber("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Client</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex items-end gap-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="name">Client Name</Label>
            <Input
              type="text"
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              type="tel"
              id="phoneNumber"
              placeholder="(555) 123-4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <Button type="submit">Add Client</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ClientsPage() {
  const { organization } = useOrganization();
  const orgId = organization?.id;

  const clients = useQuery(api.files.clients.list, orgId ? { orgId } : "skip");

  if (!organization) {
    return <div className="text-center p-8">Select an organization to manage clients.</div>;
  }

  return (
    <div className="space-y-8">
      <AddClientForm orgId={orgId as string} />

      <div>
        <h2 className="text-2xl font-bold mb-4">Your Clients</h2>
        {clients === undefined && <div>Loading clients...</div>}
        {clients && clients.length === 0 && (
          <div className="text-center p-8 border rounded-lg">
            <h2 className="text-lg font-semibold">No clients yet</h2>
            <p className="text-gray-500">
              Add your first client using the form above.
            </p>
          </div>
        )}
        {clients && clients.length > 0 && (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client._id}>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>{client.phoneNumber}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}