import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Adjust path
import { redirect } from "next/navigation";
import Link from "next/link";
import { ReviewForm } from "./_components/ReviewForm";

interface PageProps {
  params: Promise<{
    id: string; // courseId
    assignmentId: string;
    submissionId: string;
  }>
}

export default async function SubmissionReviewPage({ params }: PageProps) {
  const { id: courseId, assignmentId, submissionId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "INSTRUCTOR") {
    redirect("/auth/signin");
  }

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      user: true,
      assignment: true,
      reviews: true, // Fetch existing reviews to see if already graded
    }
  });

  if (!submission) return <div>Submission not found</div>;

  const existingReview = submission.reviews.length > 0 ? submission.reviews[0] : null;

  // Attempt to parse auto-grader test results (if Judge0 has populated them)
  let parsedResults = null;
  if (submission.testResults) {
    try {
      parsedResults = typeof submission.testResults === 'string' 
        ? JSON.parse(submission.testResults) 
        : submission.testResults;
    } catch (e) {
      console.error("Could not parse test results");
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      {/* Navigation & Header */}
      <header className="space-y-4 border-b pb-6">
        <Link 
          href={`/courses/${courseId}/assignments/${assignmentId}`}
          className="text-sm text-blue-600 hover:underline"
        >
          &larr; Back to Assignment
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Reviewing: {submission.user?.name || submission.user?.email}</h1>
            <p className="text-zinc-500">Assignment: {submission.assignment.title}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            submission.status === 'REVIEWED' ? 'bg-green-100 text-green-800' : 
            submission.status === 'GRADED' ? 'bg-blue-100 text-blue-800' : 
            'bg-yellow-100 text-yellow-800'
          }`}>
            {submission.status}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Center Column: Code and Auto-Grader Results */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Auto-Grader Panel */}
          <div className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-2">Auto-Grader Results</h2>
            {parsedResults ? (
              <div className="bg-zinc-50 p-4 rounded text-sm space-y-2">
                {/* Adjust these keys based on your actual Judge0 output JSON structure */}
                <p>Status: {parsedResults.status || "Unknown"}</p>
                {parsedResults.passed !== undefined && (
                  <p>Passed: {parsedResults.passed} / {parsedResults.total}</p>
                )}
                {parsedResults.stderr && (
                  <div className="mt-2">
                    <span className="font-semibold text-red-600">Error Output:</span>
                    <pre className="mt-1 bg-red-50 p-2 rounded text-xs text-red-800 overflow-x-auto">
                      {parsedResults.stderr}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No automated test results available (Status: {submission.status}).</p>
            )}
          </div>

          {/* Student Code Panel */}
          <div className="rounded-lg border overflow-hidden">
            <div className="bg-zinc-100 p-3 border-b">
              <h2 className="font-semibold text-sm">Submitted Code ({submission.language})</h2>
            </div>
            <pre className="bg-zinc-900 p-4 text-sm text-green-400 font-mono overflow-x-auto">
              <code>{submission.code}</code>
            </pre>
          </div>
        </div>

        {/* Right Column: Manual Grading Form */}
        <div>
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