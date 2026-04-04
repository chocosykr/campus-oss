import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSubmissions } from "@/lib/queries/submissions";
import Link from "next/link";
import { 
  Terminal, 
  Activity, 
  CheckCircle, 
  Code2, 
  AlertCircle, 
  User as UserIcon,
  ChevronRight
} from "lucide-react";

// --- Types ---
type TestResults = { passed: number; total: number } | null;

interface Submission {
  id: string;
  assignmentId: string;
  status: string;
  language: string;
  testResults: TestResults;
  createdAt: Date;
  user?: { name: string | null };
  assignment: {
    title: string;
    course: {
      id: string;
      title: string;
    };
  };
}

const STATUS_UI: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  PENDING:  { label: "Evaluating", color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-500 animate-pulse" },
  GRADED:   { label: "Graded", color: "text-sky-600", bg: "bg-sky-50", dot: "bg-sky-500" },
  REVIEWED: { label: "Reviewed", color: "text-violet-600", bg: "bg-violet-50", dot: "bg-violet-500" },
  APPROVED: { label: "Approved", color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-500" },
  REJECTED: { label: "Failed", color: "text-rose-500", bg: "bg-rose-50", dot: "bg-rose-500" },
};

export default async function SubmissionsDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  const role = (session.user as any).role;
  const rawSubmissions = await getSubmissions((session.user as any).id, role);
  
  const submissions: Submission[] = rawSubmissions.map((sub: any) => ({
    ...sub,
    testResults: sub.testResults as TestResults,
  }));

  const stats = submissions.reduce(
    (acc, sub) => {
      if (sub.status === "PENDING") acc.pending++;
      const res = sub.testResults;
      if (res && res.total > 0 && res.passed === res.total) acc.perfect++;
      return acc;
    },
    { pending: 0, perfect: 0 }
  );

  const successRate = submissions.length 
    ? Math.round((stats.perfect / submissions.length) * 100) 
    : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-10 p-6 pb-12">
      {/* Header & Analytics */}
      <header className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            {role === "INSTRUCTOR" ? "Class Submissions" : "Submission History"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {role === "INSTRUCTOR" 
              ? "Real-time telemetry from student code executions." 
              : "Track your code performance and test case history."}
          </p>
        </div>

        {submissions.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard 
              icon={<Terminal className="h-5 w-5" />} 
              label="Total Runs" 
              value={submissions.length} 
            />
            <StatCard 
              icon={<CheckCircle className="h-5 w-5 text-emerald-600" />} 
              label="Success Rate" 
              value={`${successRate}%`} 
            />
            <StatCard 
              icon={<Activity className="h-5 w-5 text-amber-600" />} 
              label="In Queue" 
              value={stats.pending} 
            />
          </div>
        )}
      </header>

      {/* Main Grid */}
      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 py-24 text-center dark:border-zinc-800">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
            <Code2 className="h-6 w-6 text-zinc-400" />
          </div>
          <h3 className="text-sm font-medium text-zinc-900 dark:text-white">No telemetry found</h3>
          <p className="mt-1 text-xs text-zinc-400">
            Once code is pushed to the judge engine, execution results will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {submissions.map((sub) => {
            const config = STATUS_UI[sub.status] || STATUS_UI.PENDING;
            const res = sub.testResults;
            const hasTests = res && res.total > 0;
            const progressPct = hasTests ? Math.round((res.passed / res.total) * 100) : 0;
            
            return (
              <Link 
                key={sub.id} 
                href={`/courses/${sub.assignment.course.id}/assignments/${sub.assignmentId}`}
                className="group flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800">
                      {sub.assignment.course.title}
                    </span>
                    <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                      {config.label}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {role === "INSTRUCTOR" && (
                      <div className="flex items-center gap-1.5 text-zinc-500">
                        <UserIcon className="h-3 w-3" />
                        <span className="text-xs font-medium">{sub.user?.name || "Student"}</span>
                      </div>
                    )}
                    <h3 className="text-base font-semibold leading-tight text-zinc-900 group-hover:text-zinc-600 dark:text-white dark:group-hover:text-zinc-300 transition-colors line-clamp-1">
                      {sub.assignment.title}
                    </h3>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  {hasTests ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-zinc-500">Test Cases</span>
                        <span className="text-zinc-900 dark:text-white tabular-nums">{res.passed} / {res.total}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div 
                          className={`h-full transition-all duration-500 ${progressPct === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 py-1 text-xs text-zinc-400">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>No test data available</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      {sub.language}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {new Date(sub.createdAt).toLocaleDateString('en-IN', { 
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-white">
          {value}
        </p>
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          {label}
        </p>
      </div>
    </div>
  );
}