"use client";

import { useState, useTransition } from "react";
import { updateAssignment, addTestCase } from "@/lib/actions/assignments";

export function InstructorControls({ assignment }: { assignment: any }) {
  const [activeForm, setActiveForm] = useState<"NONE" | "EDIT" | "TEST_CASE">("NONE");
  const [isPending, startTransition] = useTransition();

  // Bind the assignment ID to our server actions
  const editAction = updateAssignment.bind(null, assignment.id);
  const testCaseAction = addTestCase.bind(null, assignment.id);

  const handleAction = (actionFn: any, formData: FormData) => {
    startTransition(async () => {
      await actionFn(formData);
      setActiveForm("NONE"); // Close form on success
    });
  };

  return (
    <div className="space-y-4">
      {/* The Buttons */}
      <div className="flex gap-4">
        <button 
          onClick={() => setActiveForm(activeForm === "EDIT" ? "NONE" : "EDIT")}
          className="rounded bg-black px-4 py-2 text-white hover:bg-zinc-800 transition-colors"
        >
          {activeForm === "EDIT" ? "Cancel Edit" : "Edit Assignment"}
        </button>
        <button 
          onClick={() => setActiveForm(activeForm === "TEST_CASE" ? "NONE" : "TEST_CASE")}
          className="rounded border border-black px-4 py-2 hover:bg-zinc-100 transition-colors"
        >
          {activeForm === "TEST_CASE" ? "Cancel" : "+ Add Test Case"}
        </button>
      </div>

      {/* Edit Assignment Form */}
      {activeForm === "EDIT" && (
        <form action={(fd) => handleAction(editAction, fd)} className="rounded-lg border p-4 bg-zinc-50 space-y-4 max-w-xl">
          <h3 className="font-semibold text-lg">Edit Details</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input name="title" defaultValue={assignment.title} required className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea name="description" defaultValue={assignment.description} rows={4} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input name="dueDate" type="datetime-local" defaultValue={assignment.dueDate ? new Date(assignment.dueDate).toISOString().slice(0, 16) : ""} className="w-full border p-2 rounded" />
          </div>
          <button type="submit" disabled={isPending} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}

      {/* Add Test Case Form */}
      {activeForm === "TEST_CASE" && (
        <form action={(fd) => handleAction(testCaseAction, fd)} className="rounded-lg border p-4 bg-zinc-50 space-y-4 max-w-xl">
          <h3 className="font-semibold text-lg">New Test Case</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Input Data (e.g. `[1, 2, 3]`)</label>
            <textarea name="input" required rows={2} className="w-full border p-2 rounded font-mono text-sm" placeholder="Input values..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Expected Output (e.g. `6`)</label>
            <textarea name="expectedOutput" required rows={2} className="w-full border p-2 rounded font-mono text-sm" placeholder="Expected result..." />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="hidden" id="hidden" className="w-4 h-4 rounded border-gray-300" />
            <label htmlFor="hidden" className="text-sm font-medium text-zinc-700">Hidden from Students (Private Test Case)</label>
          </div>
          <button type="submit" disabled={isPending} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {isPending ? "Adding..." : "Add Test Case"}
          </button>
        </form>
      )}

      
    </div>
  );
}