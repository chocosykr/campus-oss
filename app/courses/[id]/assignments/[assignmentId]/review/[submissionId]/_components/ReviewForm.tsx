"use client";

import { useState, useTransition } from "react";
import { submitReview } from "@/lib/actions/reviews";
import { useRouter } from "next/navigation";

interface ReviewFormProps {
  submissionId: string;
  courseId: string;
  assignmentId: string;
  existingReview?: any;
}

export function ReviewForm({ submissionId, courseId, assignmentId, existingReview }: ReviewFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Bind the IDs to our server action
  const actionWithArgs = submitReview.bind(null, submissionId, courseId, assignmentId);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await actionWithArgs(formData);
      if (result.error) {
        setError(result.error);
      } else {
        // Optionally route them back to the assignment page after successful grading
        router.push(`/courses/${courseId}/assignments/${assignmentId}`);
      }
    });
  };

  if (existingReview) {
    return (
      <div className="rounded-lg border bg-green-50 p-6 border-green-200">
        <h3 className="text-lg font-semibold text-green-900 mb-4">Review Submitted</h3>
        <div className="space-y-2">
          <p><span className="font-medium">Score:</span> {existingReview.score} / 100</p>
          <p><span className="font-medium">Instructor Comment:</span> {existingReview.comment}</p>
        </div>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="rounded-lg border bg-zinc-50 p-6 space-y-4">
      <h3 className="text-lg font-semibold">Submit Grade</h3>
      
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div>
        <label className="block text-sm font-medium mb-1">Score (0-100)</label>
        <input 
          type="number" 
          name="score" 
          min="0" 
          max="100" 
          required 
          className="w-full border p-2 rounded"
          placeholder="e.g. 95"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Feedback Comment</label>
        <textarea 
          name="comment" 
          rows={4} 
          className="w-full border p-2 rounded"
          placeholder="Great job on the edge cases..."
        />
      </div>

      <button 
        type="submit" 
        disabled={isPending} 
        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? "Saving Review..." : "Submit Review"}
      </button>
    </form>
  );
}