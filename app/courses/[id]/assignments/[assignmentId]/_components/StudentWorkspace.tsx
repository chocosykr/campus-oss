"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { submitCode } from "@/lib/actions/submissions";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function StudentWorkspace({ assignment }: { assignment: any }) {
  const router = useRouter();

  const hasSubmitted = assignment?.submissions?.length > 0;
  const latestSubmission = hasSubmitted ? assignment.submissions[0] : null;
  const latestReview = latestSubmission?.reviews?.length > 0 ? latestSubmission.reviews[0] : null;

  const initialCode = latestSubmission?.code || assignment?.starterCode || "// Write your code here...";

  const [code, setCode] = useState(initialCode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWaitingForGrade, setIsWaitingForGrade] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingSubmissionId, setPendingSubmissionId] = useState<string | null>(null);

  const testResults = useMemo(() => {
    if (!latestSubmission?.testResults) return null;
    try {
      return typeof latestSubmission.testResults === 'string'
        ? JSON.parse(latestSubmission.testResults)
        : latestSubmission.testResults;
    } catch (e) {
      console.error("Failed to parse test results", e);
      return null;
    }
  }, [latestSubmission?.testResults]);
  
  useEffect(() => {
    if (!pendingSubmissionId) return;

    const channel = supabase
      .channel(`submission-watch-${pendingSubmissionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'Submission',
          filter: `id=eq.${pendingSubmissionId}`,
        },
        (payload) => {
          console.log('✅ DATABASE UPDATE DETECTED:', payload.new);

          if (payload.new.status === 'GRADED' || payload.new.status === 'REJECTED') {
            setIsWaitingForGrade(false);
            setPendingSubmissionId(null);
            router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pendingSubmissionId, router]);

  const handleRunAndSubmit = async () => {
    if (!code.trim()) return;

    setIsSubmitting(true); // 1. Start the "Submitting" phase
    setError(null);

    try {
      const result = await submitCode(assignment.id, code, assignment.language);

      if (result.error) {
        setError(result.error);
        setIsSubmitting(false); // Stop if there's an immediate error
      } else {
        // SUCCESS: Hand off to the "Waiting for Grade" phase
        setIsWaitingForGrade(true);
        setPendingSubmissionId(result.submissionId ?? null);

        // CRITICAL: Turn off the "Submitting" state now that we are "Waiting"
        setIsSubmitting(false);
      }
    } catch (err) {
      setError("Something went wrong while submitting.");
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const newCode = code.substring(0, start) + "  " + code.substring(end);
      setCode(newCode);

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Left Column: Requirements & Results (Scrollable Independent Pane) */}
      <div className="flex flex-col h-187.5 overflow-y-auto space-y-6 pr-2 custom-scrollbar">

        {/* Requirements Section */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-800 mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Requirements & Test Cases
          </h2>
          <div className="space-y-5">
            {assignment?.testCases?.map((tc: any, idx: number) => (
              !tc.hidden && (
                <div key={tc.id} className="rounded-lg border border-zinc-200 bg-zinc-50 overflow-hidden">
                  <div className="bg-zinc-100/80 px-4 py-2 border-b border-zinc-200 font-semibold text-zinc-600 text-xs uppercase tracking-wider flex justify-between">
                    <span>Example {idx + 1}</span>
                  </div>
                  <div className="p-4 space-y-3 font-mono text-sm">
                    <div>
                      <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block mb-1">Input:</span>
                      <div className="bg-white border border-zinc-200 rounded px-3 py-2 text-zinc-800">{tc.input}</div>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block mb-1">Expected Output:</span>
                      <div className="bg-white border border-zinc-200 rounded px-3 py-2 text-zinc-800">{tc.expectedOutput}</div>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isWaitingForGrade && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-8 text-center shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-100/20 animate-pulse"></div>
            <div className="relative z-10 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="text-blue-800 font-semibold text-lg">Running your code...</div>
              <div className="text-blue-600/80 text-sm">Evaluating against test cases. Results will appear automatically.</div>
            </div>
          </div>
        )}

        {/* Results State */}
        {hasSubmitted && !isWaitingForGrade && (
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-zinc-50 px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
              <h3 className="font-bold text-zinc-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                Execution Results
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm ${latestSubmission.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                latestSubmission.status === 'REJECTED' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                  latestSubmission.status === 'REVIEWED' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                    latestSubmission.status === 'GRADED' && testResults?.passed === testResults?.total ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      latestSubmission.status === 'GRADED' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-zinc-100 text-zinc-800 border border-zinc-200'
                }`}>
                {latestSubmission.status}
              </span>
            </div>

            <div className="p-6">
              {testResults ? (
                <div className="space-y-6">
                  {testResults.total !== undefined && (
                    <div className="flex items-center justify-between bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                      <span className="font-medium text-zinc-600">Total Score</span>
                      <span className={`text-xl font-black ${testResults.passed === testResults.total ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {testResults.passed} / {testResults.total} Passed
                      </span>
                    </div>
                  )}

                  {/* System Error */}
                  {testResults.error && (
                    <div className="bg-rose-50/50 border border-rose-200 p-4 rounded-lg">
                      <span className="flex items-center gap-2 text-sm font-bold text-rose-700 uppercase tracking-wider mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        System/Compilation Error
                      </span>
                      <pre className="font-mono text-sm text-rose-800 whitespace-pre-wrap bg-white p-3 rounded border border-rose-100 overflow-x-auto">{testResults.error}</pre>
                    </div>
                  )}

                  {/* Test Cases List */}
                  {testResults.details && testResults.details.length > 0 && (
                    <div className="space-y-4">
                      {testResults.details.map((tc: any, index: number) => (
                        <div key={tc.testCaseId || index} className={`rounded-lg border overflow-hidden transition-colors ${tc.passed ? 'border-emerald-200' : 'border-rose-200'
                          }`}>
                          <div className={`px-4 py-3 flex justify-between items-center ${tc.passed ? 'bg-emerald-50/50' : 'bg-rose-50/50'}`}>
                            <span className={`font-semibold text-sm ${tc.passed ? 'text-emerald-900' : 'text-rose-900'}`}>
                              Test Case #{index + 1} {tc.hidden && <span className="text-xs opacity-70 ml-1 font-normal">(Hidden)</span>}
                            </span>
                            <span className={`text-xs font-bold uppercase flex items-center gap-1 ${tc.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {tc.passed ? (
                                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Passed</>
                              ) : (
                                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> Failed</>
                              )}
                            </span>
                          </div>

                          {!tc.passed && !tc.hidden && (
                            <div className="p-4 bg-white space-y-4 font-mono text-sm border-t border-rose-100">
                              <div>
                                <span className="text-zinc-500 font-semibold uppercase tracking-wider text-xs block mb-1.5">Expected Output:</span>
                                <div className="bg-emerald-50/30 text-emerald-800 p-3 rounded border border-emerald-100 whitespace-pre-wrap">{tc.expectedOutput}</div>
                              </div>
                              <div>
                                <span className="text-zinc-500 font-semibold uppercase tracking-wider text-xs block mb-1.5">Actual Output:</span>
                                <div className="bg-rose-50/30 text-rose-800 p-3 rounded border border-rose-100 whitespace-pre-wrap">{tc.error || tc.actualOutput || "(No Output)"}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-zinc-500 bg-zinc-50 rounded-lg border border-dashed border-zinc-300">
                  <div className="mb-2">⏳</div>
                  Code execution pending. Auto-grader results will appear here.
                </div>
              )}
            </div>

            {/* Instructor Review Section */}
            {latestReview && (
              <div className="border-t border-zinc-200 bg-zinc-50/50 p-6">
                <h4 className="font-bold text-zinc-800 flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Instructor Feedback
                </h4>
                <div className="bg-white rounded-lg p-5 border border-zinc-200 shadow-sm">
                  <div className="mb-4 flex items-center justify-between pb-4 border-b border-zinc-100">
                    <span className="font-semibold text-zinc-600">Final Grade</span>
                    <span className={`font-black text-2xl ${latestReview.score >= 70 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {latestReview.score} <span className="text-lg text-zinc-400 font-medium">/ 100</span>
                    </span>
                  </div>
                  {latestReview.comment && (
                    <div>
                      <span className="font-semibold text-zinc-700 block mb-2 text-sm">Reviewer Comment:</span>
                      <p className="whitespace-pre-wrap bg-zinc-50 p-4 rounded-md border border-zinc-100 text-zinc-700 leading-relaxed text-sm">
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

      {/* Right Column: Code Editor (VS Code Style) */}
      <div className="flex flex-col h-187.5 rounded-xl overflow-hidden shadow-md border border-zinc-300 bg-[#1e1e1e] ring-1 ring-zinc-900/5">

        {/* Editor Tab Bar */}
        <div className="bg-[#2d2d2d] flex items-end px-2 pt-2 border-b border-[#1e1e1e] select-none">
          <div className="bg-[#1e1e1e] px-4 py-2.5 rounded-t-md border-t-2 border-t-blue-500 flex items-center gap-2 text-zinc-300 text-sm font-medium">
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
            </svg>
            main.{assignment?.language === 'python' ? 'py' : assignment?.language === 'javascript' ? 'js' : 'txt'}
          </div>
        </div>

        {/* Text Area Container */}
        <div className="grow relative bg-[#1e1e1e]">
          <textarea
            className="absolute inset-0 w-full h-full p-5 bg-transparent text-[#d4d4d4] font-mono text-sm focus:outline-none resize-none leading-relaxed custom-scrollbar"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck="false"
            placeholder="Write your code here..."
          />
        </div>

        {/* Bottom Action Bar */}
        <div className="bg-[#252526] p-4 border-t border-zinc-800 flex items-center justify-between shrink-0">
          <div className="text-rose-400 text-sm font-medium px-2 truncate max-w-[50%]">
            {error && <span>⚠️ {error}</span>}
          </div>
          <button
            onClick={handleRunAndSubmit}
            disabled={isSubmitting || isWaitingForGrade || !code.trim()}
            className="rounded-md bg-blue-600 px-6 py-2.5 text-white text-sm font-bold tracking-wide hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95"
          >
            {isSubmitting ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Submitting...</>
            ) : isWaitingForGrade ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Evaluating...</>
            ) : (
              <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg> Run & Submit</>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}