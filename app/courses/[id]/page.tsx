import { getCourse } from "@/lib/queries/courses";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Calendar, FileCode, Users, BookOpen } from "lucide-react";

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

const LANG_COLORS: Record<string, string> = {
  python:     "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  javascript: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  java:       "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  cpp:        "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;

  const course = await getCourse(id);
  if (!course) notFound();

  const isOwner = course.instructorId === userId || role === "ADMIN";
  const assignments = course.assignments ?? [];

  const now = new Date();

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <Link
        href="/courses"
        className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Courses
      </Link>

      {/* Course Header */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
              {course.title}
            </h1>
            {course.description && (
              <p className="text-sm text-zinc-500 max-w-xl">{course.description}</p>
            )}
            <p className="text-xs text-zinc-400 pt-1">
              Taught by{" "}
              <span className="font-medium text-zinc-500">
                {course.instructor.name ?? course.instructor.email}
              </span>
            </p>
          </div>

          {isOwner && (
            <Link
              href={`/courses/${course.id}/assignments/new`}
              className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Assignment
            </Link>
          )}
        </div>

        {/* Stats row */}
        <div className="mt-6 flex flex-wrap items-center gap-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Users className="h-4 w-4 text-zinc-400" />
            <span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {course._count?.enrollments ?? 0}
              </span>{" "}
              student{course._count?.enrollments !== 1 ? "s" : ""} enrolled
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <BookOpen className="h-4 w-4 text-zinc-400" />
            <span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {course._count?.assignments ?? 0}
              </span>{" "}
              assignment{course._count?.assignments !== 1 ? "s" : ""}
            </span>
          </div>
          {isOwner && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-zinc-400">Join code:</span>
              <span className="font-mono text-sm font-semibold tracking-widest text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg">
                {course.joinCode}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Assignments */}
      <div>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Assignments
        </h2>

        {assignments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
              <FileCode className="h-6 w-6 text-zinc-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              No assignments yet
            </p>
            {isOwner && (
              <Link
                href={`/courses/${course.id}/assignments/new`}
                className="mt-3 inline-block text-sm font-medium text-zinc-500 underline hover:text-zinc-900 dark:hover:text-white"
              >
                Create the first assignment
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {assignments.map((assignment: any) => {
              const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < now;
              const langColor = LANG_COLORS[assignment.language] ?? LANG_COLORS.cpp;

              return (
                <Link
                  key={assignment.id}
                  href={`/courses/${course.id}/assignments/${assignment.id}`}
                  className="group flex flex-col justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-medium text-zinc-900 dark:text-white group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors">
                      {assignment.title}
                    </h3>
                    <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${langColor}`}>
                      {assignment.language}
                    </span>
                  </div>

                  {assignment.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-zinc-500">
                      {assignment.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-4 text-xs text-zinc-400">
                    {assignment.dueDate && (
                      <span className={`flex items-center gap-1 ${isOverdue ? "text-rose-500" : ""}`}>
                        <Calendar className="h-3 w-3" />
                        {isOverdue ? "Overdue · " : "Due · "}
                        {new Date(assignment.dueDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    )}
                    <span className="ml-auto">
                      {assignment._count?.submissions ?? 0} submission{assignment._count?.submissions !== 1 ? "s" : ""}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}