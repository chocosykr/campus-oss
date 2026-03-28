import Link from "next/link";
import { InstructorControls } from "../_components/InstructorControls"; // Adjust path if needed

export default async function InstructorView({ assignment, courseId }: { assignment: any, courseId: string }) {
  
  // Helper function to color-code the status badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REVIEWED': return 'bg-blue-100 text-blue-800';
      case 'GRADED':   return 'bg-purple-100 text-purple-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default:         return 'bg-yellow-100 text-yellow-800'; // PENDING
    }
  };

  return (
    <div className="space-y-8">
      {/* Interactive controls for editing and adding test cases */}
      <InstructorControls assignment={assignment} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Cases Summary */}
        <div className="rounded-lg border p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Test Cases ({assignment.testCases.length})</h2>
          {assignment.testCases.length === 0 ? (
            <p className="text-sm text-zinc-500">No test cases added yet.</p>
          ) : (
            <ul className="space-y-3 text-sm text-zinc-600">
              {assignment.testCases.map((tc: any, idx: number) => (
                <li key={tc.id} className="flex justify-between border-b pb-3 items-start last:border-0 last:pb-0">
                  <div>
                    <span className="font-medium text-black">Test {idx + 1}</span>
                    {tc.hidden && <span className="ml-2 rounded bg-zinc-200 px-2 py-0.5 text-[10px] uppercase font-bold text-zinc-600">Hidden</span>}
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs truncate w-32 bg-zinc-100 px-2 py-1 rounded">In: {tc.input}</div>
                    <div className="font-mono text-xs truncate w-32 bg-zinc-100 px-2 py-1 rounded mt-1">Out: {tc.expectedOutput}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Submissions Feed */}
        <div className="rounded-lg border p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Recent Submissions</h2>
          {assignment.submissions.length === 0 ? (
            <p className="text-sm text-zinc-500">No submissions yet.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {assignment.submissions.map((sub: any) => (
                <li key={sub.id}>
                  {/* Made the entire row a clickable link to the review page */}
                  <Link 
                    href={`/courses/${courseId}/assignments/${assignment.id}/review/${sub.id}`}
                    className="flex items-center justify-between rounded-md bg-zinc-50 p-3 border hover:bg-zinc-100 hover:border-blue-300 transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-zinc-900 group-hover:text-blue-700">
                        {sub.user?.name || sub.user?.email}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${getStatusBadge(sub.status)}`}>
                      {sub.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}