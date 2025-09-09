"use client";

import { useMutation, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FormEvent, useState } from "react";

function TaskList({ callId }: { callId: Id<"calls"> }) {
  const tasks = useQuery(api.files.tasks.listByCall, { callId });
  const updateStatus = useMutation(api.files.tasks.updateStatus);

  if (tasks === undefined) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className="space-y-2">
      {tasks.length === 0 ? (
        <p className="text-sm text-gray-500">No tasks for this call yet.</p>
      ) : (
        tasks.map((task) => {
          const isOverdue =
            task.status === "pending" &&
            task.dueDate &&
            task.dueDate < Date.now();
            
          return (
            <div key={task._id} className="flex items-center space-x-2">
              <Checkbox
                id={task._id}
                checked={task.status === "completed"}
                onCheckedChange={(checked) => {
                  updateStatus({
                    taskId: task._id,
                    status: checked ? "completed" : "pending",
                  });
                }}
              />
              <label
                htmlFor={task._id}
                className={`text-sm font-medium leading-none ${
                  task.status === "completed" ? "line-through text-gray-500" : ""
                }`}
              >
                {task.description}
              </label>
              {task.dueDate && (
                <span
                  className={`text-xs ${
                    isOverdue ? "text-red-600 font-semibold" : "text-gray-400"
                  }`}
                >
                  - Due {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

function AddTaskForm({ callId }: { callId: Id<"calls"> }) {
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const createTask = useMutation(api.files.tasks.create);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!description) return;

    await createTask({
      callId,
      description,
      dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
    });
    setDescription("");
    setDueDate("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="description">New Task</Label>
        <Input
          type="text"
          id="description"
          placeholder="Follow up with client"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
       <div className="grid w-full max-w-xs items-center gap-1.5">
        <Label htmlFor="dueDate">Due Date</Label>
        <Input
          type="date"
          id="dueDate"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      <Button type="submit">Add Task</Button>
    </form>
  );
}

export default function CallDetailPage() {
  const params = useParams<{ callId: string }>();
  const callId = params.callId as Id<"calls">;

  const call = useQuery(api.files.calls.get, { callId });
  // Fix: The `useMutation` hook from `convex/react` returns a function, not an
  // object with `mutate` and `isPending` properties. The pending state is
  // managed manually with `useState` below.
  const generateSummary = useMutation(api.files.calls.generateSummary);
  const [isSummaryPending, setIsSummaryPending] = useState(false);


  if (call === undefined) {
    return <div>Loading call details...</div>;
  }

  if (call === null) {
    return <div>Call not found or you do not have permission to view it.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Call Details</CardTitle>
            <CardDescription>
              Call from {call.clientPhoneNumber} on{" "}
              {new Date(call._creationTime).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Status:{" "}
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  call.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : call.status === "processing"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {call.status}
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">
              {call.transcript ?? "No transcript available."}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 whitespace-pre-wrap">
              {isSummaryPending ? "Generating..." : (call.summary ?? "No summary available.")}
            </p>
            {call.transcript && !call.summary && (
              <Button
                onClick={() => {
                  setIsSummaryPending(true);
                  generateSummary({ callId }).finally(() => {
                    setIsSummaryPending(false);
                  });
                }}
                disabled={isSummaryPending}
              >
                {isSummaryPending ? "Generating..." : "Generate Summary"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>
              Manage follow-up tasks for this call.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AddTaskForm callId={callId} />
            <div className="pt-4">
               <TaskList callId={callId} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
