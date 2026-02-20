import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookOpen, FileText, Users, Plus } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;

  const [courseCount, recentCourses] = await Promise.all([
    prisma.course.count(
      role === "INSTRUCTOR"
        ? { where: { instructorId: userId } }
        : undefined
    ),
    prisma.course.findMany({
      where: role === "INSTRUCTOR" ? { instructorId: userId } : undefined,
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        instructor: { select: { name: true } },
        _count: { select: { projects: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          Welcome back, {session?.user?.name?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Here's what's happening with your courses.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<BookOpen className="h-5 w-5" />}
          label="Courses"
          value={courseCount}
        />
        <StatCard
          icon={<FileText className="h-5 w-5" />}
          label="Submissions"
          value={0}
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Teams"
          value={0}
        />
      </div>

      {/* Recent courses */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Recent Courses
          </h2>
          <div className="flex gap-2">
            {(role === "INSTRUCTOR" || role === "ADMIN") && (
              <Link
                href="/courses/new"
                className="flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                <Plus className="h-3.5 w-3.5" />
                New Course
              </Link>
            )}
            <Link
              href="/courses"
              className="rounded-md px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            >
              View all →
            </Link>
          </div>
        </div>

        <div className="mt-3 divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
          {recentCourses.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-zinc-400">
              No courses yet.{" "}
              {(role === "INSTRUCTOR" || role === "ADMIN") && (
                <Link href="/courses/new" className="underline">
                  Create one
                </Link>
              )}
            </div>
          ) : (
            recentCourses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {course.title}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {course._count.projects} project
                    {course._count.projects !== 1 ? "s" : ""}
                  </p>
                </div>
                <span className="text-xs text-zinc-400">→</span>
              </Link>
            ))
          )}
        </div>
      </div>
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
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2 text-zinc-400">{icon}</div>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-white">
        {value}
      </p>
      <p className="mt-0.5 text-sm text-zinc-500">{label}</p>
    </div>
  );
}