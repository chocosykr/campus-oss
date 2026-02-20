"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signupAction } from "@/actions/auth";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Loader2, Github } from "lucide-react";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create account
        </button>
    );
}



export default function SignUpPage() {
    const [state, action] = useActionState(signupAction, {});

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
            <div className="w-full max-w-sm space-y-6">

                {/* Logo */}
                <div className="text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 dark:bg-white">
                        <span className="text-lg font-bold text-white dark:text-zinc-900">C</span>
                    </div>
                    <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                        Create an account
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500">Join Campus OSS today</p>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <form action={action} className="space-y-4">
                        {state.error && (
                            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                                {state.error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Full name
                            </label>
                            <input
                                name="name"
                                type="text"
                                placeholder="Alex Johnson"
                                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-white"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="you@university.edu"
                                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-white"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="password"
                                type="password"
                                required
                                placeholder="Min. 8 characters"
                                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-white"
                            />
                        </div>

                        {/* Role selection */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                I am a… <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { value: "STUDENT", label: "Student" },
                                    { value: "INSTRUCTOR", label: "Instructor" },
                                ].map(({ value, label }) => (
                                    <label
                                        key={value}
                                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm has-[:checked]:border-zinc-900 has-[:checked]:bg-zinc-50 dark:border-zinc-700 dark:has-[:checked]:border-white dark:has-[:checked]:bg-zinc-800"
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value={value}
                                            defaultChecked={value === "STUDENT"}
                                            className="accent-zinc-900 dark:accent-white"
                                        />
                                        {label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <SubmitButton />
                    </form>

                    <div className="my-4 flex items-center gap-3">
                        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
                        <span className="text-xs text-zinc-400">or</span>
                        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
                    </div>

                    <button
                        onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                        <Github className="h-4 w-4" />
                        Continue with GitHub
                    </button>
                </div>

                <p className="text-center text-sm text-zinc-500">
                    Already have an account?{" "}
                    <Link
                        href="/auth/signin"
                        className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-white"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}