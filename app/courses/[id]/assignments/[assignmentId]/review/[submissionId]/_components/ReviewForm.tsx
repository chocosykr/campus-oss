"use client";

import { useState, useTransition } from "react";
import { submitReview } from "@/lib/actions/reviews";
import { useRouter } from "next/navigation";
import { CheckCircle2, MessageSquare, Star } from "lucide-react";

interface ReviewFormProps {
  submissionId: string;
  courseId: string;
  assignmentId: string;
  existingReview?: any;
}

export function ReviewForm({ submissionId, courseId, assignmentId, existingReview }: ReviewFormProps) {
  const [isPending, startTransition] = useTransition();
  const [score, setScore] = useState<number>(existingReview?.score ?? 80);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const actionWithArgs = submitReview.bind(null, submissionId, courseId, assignmentId);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await actionWithArgs(formData);
      if (result.error) {
        setError(result.error);
      } else {
        router.push(`/courses/${courseId}/assignments/${assignmentId}`);
      }
    });
  };

  if (existingReview) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <h3 className="font-semibold text-emerald-900 dark:text-emerald-300">Review Submitted</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900 px-4 py-3">
            <span className="text-sm text-zinc-500">Score</span>
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {existingReview.score}
              <span className="text-sm font-normal text-zinc-400"> / 100</span>
            </span>
          </div>
          {existingReview.comment && (
            <div className="rounded-xl bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900 px-4 py-3">
              <p className="text-xs text-zinc-400 mb-1">Feedback</p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {existingReview.comment}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const scoreColor =
    score >= 80 ? "text-emerald-600" :
    score >= 50 ? "text-amber-600" :
    "text-rose-600";

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Star className="h-4 w-4 text-zinc-400" />
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Submit Grade</h3>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 px-4 py-3 text-sm text-rose-700 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Score Slider */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Score</label>
          <span className={`text-3xl font-bold tabular-nums ${scoreColor}`}>
            {score}
            <span className="text-sm font-normal text-zinc-400"> / 100</span>
          </span>
        </div>
        <input
          type="range"
          name="score"
          min="0"
          max="100"
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          className="w-full accent-zinc-900 dark:accent-white"
        />
        <div className="flex justify-between text-xs text-zinc-400">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      {/* Comment */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <MessageSquare className="h-3.5 w-3.5" />
          Feedback
        </label>
        <textarea
          name="comment"
          rows={5}
          placeholder="Great edge case handling. Consider optimizing the loop in line 12..."
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-zinc-900 dark:bg-white px-4 py-3 text-sm font-semibold text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
      >
        {isPending ? "Saving..." : "Submit Review"}
      </button>
    </form>
  );
}