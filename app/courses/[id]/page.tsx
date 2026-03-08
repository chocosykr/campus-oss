import { getCourse } from "@/actions/courses";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Calendar, FileCode } from "lucide-react";

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;
  const { id } = await params;
  const course = await getCourse(id);
  if (!course) notFound();

  const isOwner = course.instructorId === userId || role === "ADMIN";
  const assignments = course.assignments ?? [];

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/courses"
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Courses
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
              {course.title}
            </h1>
            {course.description && (
              <p className="mt-1 text-sm text-zinc-500">{course.description}</p>
            )}
            <p className="mt-2 text-xs text-zinc-400">
              Taught by {course.instructor.name ?? course.instructor.email}
            </p>
            {isOwner && (
              <p className="mt-1 text-xs font-mono text-zinc-400">
                Join code: <span className="font-semibold">{course.joinCode}</span>
              </p>
            )}
          </div>

          {isOwner && (
            <Link
              href={`/courses/${course.id}/assignments/new`}
              className="flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4" />
              New Assignment
            </Link>
          )}
        </div>
      </div>

      {/* Assignments */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Assignments ({course._count?.assignments ?? 0})
        </h2>

        {assignments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 py-12 text-center dark:border-zinc-800">
            <FileCode className="mx-auto h-8 w-8 text-zinc-300" />
            <p className="mt-2 text-sm text-zinc-400">No assignments yet.</p>
            {isOwner && (
              <Link
                href={`/courses/${course.id}/assignments/new`}
                className="mt-3 inline-block text-sm font-medium underline text-zinc-500 hover:text-zinc-900"
              >
                Create the first assignment
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {assignments.map((assignment:any) => (
              <Link
                key={assignment.id}
                href={`/courses/${course.id}/assignments/${assignment.id}`}
                className="group rounded-xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-zinc-900 dark:text-white">
                    {assignment.title}
                  </h3>
                  <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {assignment.language}
                  </span>
                </div>
                {assignment.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                    {assignment.description}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-4 text-xs text-zinc-400">
                  {assignment.dueDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Due {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  <span>{assignment._count?.submissions ?? 0} submissions</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Enrollment Stats */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500">
          {course._count?.enrollments ?? 0} student{course._count?.enrollments !== 1 ? 's' : ''} enrolled
        </p>
      </div>
    </div>
  );
}