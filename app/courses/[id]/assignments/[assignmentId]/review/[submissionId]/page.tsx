import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ReviewForm } from "./_components/ReviewForm";
import { ArrowLeft, CheckCircle2, XCircle, Clock, User, Code2 } from "lucide-react";

interface PageProps {
  params: Promise<{
    id: string;
    assignmentId: string;
    submissionId: string;
  }>;
}

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  PENDING:  { label: "Pending",  className: "bg-amber-50 text-amber-700 border-amber-200",   icon: <Clock className="h-3.5 w-3.5" /> },
  GRADED:   { label: "Graded",   className: "bg-sky-50 text-sky-700 border-sky-200",         icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  REVIEWED: { label: "Reviewed", className: "bg-violet-50 text-violet-700 border-violet-200", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  APPROVED: { label: "Approved", className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  REJECTED: { label: "Rejected", className: "bg-rose-50 text-rose-700 border-rose-200",      icon: <XCircle className="h-3.5 w-3.5" /> },
};

export default async function SubmissionReviewPage({ params }: PageProps) {
  const { id: courseId, assignmentId, submissionId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "INSTRUCTOR") {
    redirect("/auth/signin");
  }

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      user: true,
      assignment: true,
      reviews: true,
    },
  });

  if (!submission) return <div>Submission not found</div>;

  const existingReview = submission.reviews[0] ?? null;

  let parsedResults: any = null;
  if (submission.testResults) {
    try {
      parsedResults = typeof submission.testResults === "string"
        ? JSON.parse(submission.testResults)
        : submission.testResults;
    } catch {}
  }

  const status = STATUS_CONFIG[submission.status] ?? STATUS_CONFIG.PENDING;
  const hasPassed = parsedResults?.total > 0;
  const allPassed = hasPassed && parsedResults.passed === parsedResults.total;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Link
          href={`/courses/${courseId}/assignments/${assignmentId}`}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Assignment
        </Link>
        <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}>
          {status.icon}
          {status.label}
        </span>
      </div>

      {/* Header */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              {submission.assignment.title}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <User className="h-4 w-4 text-zinc-500" />
              </div>
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                {submission.user?.name ?? submission.user?.email}
              </h1>
            </div>
          </div>

          {/* Auto-grader score */}
          {hasPassed && (
            <div className={`flex flex-col items-center rounded-2xl border px-6 py-3 ${
              allPassed
                ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
                : "border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30"
            }`}>
              <span className={`text-3xl font-bold tabular-nums ${allPassed ? "text-emerald-600" : "text-rose-600"}`}>
                {parsedResults.passed}/{parsedResults.total}
              </span>
              <span className="text-xs text-zinc-500 mt-0.5">test cases</span>
            </div>
          )}
        </div>

        {/* Test case details */}
        {parsedResults?.details && (
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {parsedResults.details.map((tc: any, i: number) => (
              !tc.hidden && (
                <div
                  key={i}
                  className={`rounded-xl border px-3 py-2.5 text-xs ${
                    tc.passed
                      ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20"
                      : "border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/20"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-medium">
                    {tc.passed
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      : <XCircle className="h-3.5 w-3.5 text-rose-500" />
                    }
                    <span className={tc.passed ? "text-emerald-700" : "text-rose-700"}>
                      Case {i + 1}
                    </span>
                  </div>
                  {!tc.passed && tc.error && (
                    <p className="mt-1 text-rose-500 truncate">{tc.error}</p>
                  )}
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Code panel */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                Submitted Code
              </span>
            </div>
            <span className="rounded-md bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 text-xs font-mono text-zinc-600 dark:text-zinc-300">
              {submission.language}
            </span>
          </div>
          <pre className="bg-zinc-950 p-5 text-sm text-emerald-400 font-mono overflow-x-auto max-h-150 overflow-y-auto leading-relaxed">
            <code>{submission.code}</code>
          </pre>
        </div>

        {/* Review panel */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <ReviewForm
            submissionId={submission.id}
            courseId={courseId}
            assignmentId={assignmentId}
            existingReview={existingReview}
          />
        </div>
      </div>
    </div>
  );
}