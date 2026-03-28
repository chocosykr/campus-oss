"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitCode } from "@/lib/actions/submissions";
import { createClient, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function StudentWorkspace({ assignment }: { assignment: any }) {
  const router = useRouter();

  const hasSubmitted = assignment.submissions?.length > 0;
  const latestSubmission = hasSubmitted ? assignment.submissions[0] : null;
  const latestReview = latestSubmission?.reviews?.length > 0 ? latestSubmission.reviews[0] : null;

  const initialCode = latestSubmission?.code || assignment.starterCode || "// Write your code here...";

  const [code, setCode] = useState(initialCode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWaitingForGrade, setIsWaitingForGrade] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingSubmissionId, setPendingSubmissionId] = useState<string | null>(null);

  // Subscribe to the NEW submission id after submitting
  useEffect(() => {
    if (!pendingSubmissionId) return;

    console.log('[realtime] Subscribing to pending submission:', pendingSubmissionId);

    const channel = supabase
      .channel(`submission-${pendingSubmissionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'Submission',
          filter: `id=eq.${pendingSubmissionId}`,
        },
        (payload: RealtimePostgresChangesPayload<{ status: string }>) => {
          console.log('[realtime] Received update:', payload);
          if (payload.new && 'status' in payload.new && payload.new.status === 'GRADED') {
            console.log('[realtime] Status is GRADED, refreshing...');
            setIsWaitingForGrade(false);
            setPendingSubmissionId(null);
            router.refresh();
          }
        }
      )
      .subscribe((status, err) => {
        console.log('[realtime] Subscription status:', status);
        if (err) console.error('[realtime] Subscription error:', err);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pendingSubmissionId]);

  // Subscribe to realtime updates for the latest submission
  useEffect(() => {
    if (!latestSubmission?.id || latestSubmission.status === 'GRADED') {
      console.log('[realtime] Skipping subscription — no id or already graded');
      return;
    }

    console.log('[realtime] Subscribing to submission:', latestSubmission.id);

    const channel = supabase
  .channel(`submission-${pendingSubmissionId}`)
  .on('broadcast', { event: 'graded' }, (payload) => {
    console.log('[realtime] Broadcast received:', payload);
    setIsWaitingForGrade(false);
    setPendingSubmissionId(null);
    router.refresh();
  })
  .subscribe((status, err) => {
    console.log('[realtime] Subscription status:', status);
    if (err) console.error('[realtime] error:', err);
  });
  }, [latestSubmission?.id]);

  let testResults: any = null;
  if (latestSubmission?.testResults) {
    try {
      testResults = typeof latestSubmission.testResults === 'string'
        ? JSON.parse(latestSubmission.testResults)
        : latestSubmission.testResults;
    } catch (e) {
      console.error("Failed to parse test results");
    }
  }

  const handleRunAndSubmit = async () => {
    if (!code.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitCode(assignment.id, code, assignment.language);

      if (result.error) {
        setError(result.error);
      } else {
        setIsWaitingForGrade(true);
        setPendingSubmissionId(result.submissionId ?? null);
      }
    } catch (err) {
      setError("Something went wrong while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column: Requirements & Results */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Public Test Cases</h2>
          <div className="space-y-4">
            {assignment.testCases.map((tc: any) => (
              <div key={tc.id} className="rounded-md bg-zinc-900 p-4 text-sm text-white font-mono overflow-x-auto shadow-sm">
                <div><span className="text-zinc-400">Input:</span> {tc.input}</div>
                <div><span className="text-zinc-400">Expected:</span> {tc.expectedOutput}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Waiting for grade state */}
        {isWaitingForGrade && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-5 text-center space-y-2">
            <div className="text-blue-700 font-medium">Running your code...</div>
            <div className="text-blue-500 text-sm">Results will appear automatically</div>
          </div>
        )}

        {hasSubmitted && !isWaitingForGrade && (
          <div className="rounded-lg border p-5 border-zinc-200 bg-white shadow-sm space-y-6">

            {/* Overall Status */}
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="font-semibold text-zinc-900">Latest Submission</h3>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${latestSubmission.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                latestSubmission.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  latestSubmission.status === 'REVIEWED' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                }`}>
                {latestSubmission.status}
              </span>
            </div>

            {testResults ? (
              <div className="space-y-3">
                <h4 className="font-semibold text-zinc-800 text-sm uppercase tracking-wider">Execution Results</h4>

                {testResults.total !== undefined && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-zinc-600">Test Cases Passed:</span>
                    <span className={`font-mono font-bold ${testResults.passed === testResults.total ? 'text-green-600' : 'text-red-600'}`}>
                      {testResults.passed} / {testResults.total}
                    </span>
                  </div>
                )}

                {testResults.status && (
                  <div className="text-sm">
                    <span className="text-zinc-600">Judge Status: </span>
                    <span className="font-medium text-zinc-900">{testResults.status}</span>
                  </div>
                )}

                {testResults.stdout && (
                  <div className="mt-2">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Standard Output</span>
                    <pre className="mt-1 bg-zinc-900 text-zinc-300 p-3 rounded-md font-mono text-xs overflow-x-auto max-h-40">
                      {testResults.stdout}
                    </pre>
                  </div>
                )}

                {(testResults.stderr || testResults.compile_output) && (
                  <div className="mt-2">
                    <span className="text-xs font-semibold text-red-500 uppercase tracking-wider">Errors / Warnings</span>
                    <pre className="mt-1 bg-red-50 text-red-700 border border-red-200 p-3 rounded-md font-mono text-xs overflow-x-auto max-h-40">
                      {testResults.stderr || testResults.compile_output}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-4 text-center text-sm text-zinc-500 bg-zinc-50 rounded-md border border-dashed">
                Code execution pending. Auto-grader results will appear here.
              </div>
            )}

            {latestReview && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-zinc-800 text-sm uppercase tracking-wider mb-3">Instructor Feedback</h4>
                <div className="bg-blue-50 rounded-md p-4 text-sm text-zinc-700 border border-blue-100">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-semibold text-blue-900">Final Score:</span>
                    <span className={`font-bold text-lg ${latestReview.score >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                      {latestReview.score} / 100
                    </span>
                  </div>
                  {latestReview.comment && (
                    <div>
                      <span className="font-semibold text-blue-900 block mb-1">Comment:</span>
                      <p className="whitespace-pre-wrap bg-white p-3 rounded border border-blue-100 text-zinc-800">
                        {latestReview.comment}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column: Code Editor */}
      <div className="flex flex-col h-[600px] border rounded-lg overflow-hidden shadow-sm">
        <div className="bg-zinc-100 p-2 border-b flex justify-between items-center">
          <span className="text-sm font-medium text-zinc-600 px-2">
            main.{assignment.language === 'python' ? 'py' : assignment.language === 'javascript' ? 'js' : 'txt'}
          </span>
        </div>

        <textarea
          className="flex-grow p-4 bg-zinc-900 text-green-400 font-mono text-sm focus:outline-none resize-none leading-relaxed"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck="false"
        />

        <div className="bg-zinc-100 p-4 border-t flex flex-col items-end gap-2">
          {error && <span className="text-red-500 text-sm font-medium">{error}</span>}
          <button
            onClick={handleRunAndSubmit}
            disabled={isSubmitting || isWaitingForGrade || !code.trim()}
            className="rounded bg-blue-600 px-6 py-2 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
          >
            {isSubmitting ? "Submitting..." : isWaitingForGrade ? "Running..." : "Run Code & Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}