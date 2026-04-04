import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getInstructorDashboard, getStudentDashboard } from "@/lib/queries/dashboard";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, FileText, Plus, ChevronRight, LayoutDashboard } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const data = role === "INSTRUCTOR" 
    ? await getInstructorDashboard(userId)
    : await getStudentDashboard(userId);

  const firstName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto max-w-7xl space-y-10 p-6">
      {/* Header Section */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Welcome back, {firstName}
        </h1>
        <p className="text-sm text-zinc-500">
          Overview of your active courses and recent activity.
        </p>
      </header>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<BookOpen className="h-5 w-5" />}
          label={role === "INSTRUCTOR" ? "Active Courses" : "Enrolled Courses"}
          value={data.courseCount}
        />
        <StatCard
          icon={<FileText className="h-5 w-5" />}
          label="Total Submissions"
          value={data.submissionCount}
        />
      </div>

      {/* Recent Courses Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Recent Courses
          </h2>
          <div className="flex items-center gap-4">
            {(role === "INSTRUCTOR" || role === "ADMIN") && (
              <Link
                href="/courses/new"
                className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                <Plus className="h-4 w-4" />
                New Course
              </Link>
            )}
            <Link
              href="/courses"
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white"
            >
              View all
            </Link>
          </div>
        </div>

        {data.recentCourses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 py-16 text-center dark:border-zinc-800">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
              <LayoutDashboard className="h-6 w-6 text-zinc-400" />
            </div>
            <h3 className="text-sm font-medium text-zinc-900 dark:text-white">No active courses</h3>
            <p className="mt-1 text-xs text-zinc-400">
              {role === "INSTRUCTOR" 
                ? "Start by creating your first course to begin teaching." 
                : "Enter a course code provided by your instructor to join."}
            </p>
            {role === "INSTRUCTOR" && (
              <Link
                href="/courses/new"
                className="mt-4 inline-flex text-xs font-medium text-zinc-900 underline underline-offset-4 dark:text-white"
              >
                Create course
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {data.recentCourses.map((course: any) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                    {course.title}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {course._count.assignments} active assignment
                    {course._count.assignments !== 1 ? "s" : ""}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-white">
          {value}
        </p>
        <p className="text-sm font-medium text-zinc-500">
          {label}
        </p>
      </div>
    </div>
  );
}