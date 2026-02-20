"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createCourseAction } from "@/actions/courses";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Course
        </button>
    );
}

export default function NewCoursePage() {
    const [state, action] = useActionState(createCourseAction, {});

    return (
        <div className="mx-auto max-w-lg space-y-6">
            <div>
                <Link
                    href="/courses"
                    className="mb-4 flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Courses
                </Link>
                <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
                    Create Course
                </h1>
            </div>

            <form
                action={action}
                className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
                {state.error && (
                    <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                        {state.error}
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        name="title"
                        required
                        placeholder="e.g. Introduction to Computer Science"
                        className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-white"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Description
                    </label>
                    <textarea
                        name="description"
                        rows={3}
                        placeholder="What will students learn?"
                        className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-white"
                    />
                </div>

                <div className="flex justify-end">
                    <SubmitButton />
                </div>
            </form>
        </div>
    );
}