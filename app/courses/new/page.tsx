"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createCourseAction, CourseFormState } from "@/lib/actions/courses";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      Create Course
    </button>
  );
}

export default function NewCoursePage() {
  const [state, action] = useActionState(createCourseAction, {} as CourseFormState);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Navigation & Header */}
      <div className="space-y-4">
        <Link
          href="/courses"
          className="flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Courses
        </Link>
        
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Create Course
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Set up a new learning environment for your students.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <form
        action={action}
        className="rounded-2xl border border-zinc-200 bg-white p-8 space-y-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        {state?.error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
            {state.error}
          </div>
        )}

        <div className="space-y-2">
          <label 
            htmlFor="title" 
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400"
          >
            Title <span className="text-rose-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="e.g. Data Structures & Algorithms"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:ring-white transition-all"
          />
        </div>

        <div className="space-y-2">
          <label 
            htmlFor="description" 
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Provide a brief overview of the course objectives..."
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:ring-white transition-all"
          />
          <p className="text-xs text-zinc-400">
            This will be visible to students on the course overview page.
          </p>
        </div>

        <div className="flex items-center justify-end pt-2">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}