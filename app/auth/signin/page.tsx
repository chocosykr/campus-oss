"use client";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, Suspense } from "react";
import { Loader2, Github } from "lucide-react";

function SignInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const registered = searchParams.get("registered");
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password.");
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm space-y-6">

        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 dark:bg-white">
            <span className="text-lg font-bold text-white dark:text-zinc-900">C</span>
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Sign in to Campus OSS</p>
        </div>

        {/* Registered success banner */}
        {registered && (
          <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-400">
            Account created! You can now sign in.
          </div>
        )}

        {/* Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign in
            </button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
            <span className="text-xs text-zinc-400">or</span>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
          </div>

          <button
            onClick={() => signIn("github", { callbackUrl })}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <Github className="h-4 w-4" />
            Continue with GitHub
          </button>
        </div>

        <p className="text-center text-sm text-zinc-500">
          Don't have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-white"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  );
}