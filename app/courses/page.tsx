import { getCourses } from "@/actions/courses";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Plus, Search, BookOpen } from "lucide-react";

interface CoursesPageProps {
  searchParams: { page?: string; q?: string };
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  const page = parseInt(searchParams.page ?? "1");
  const search = searchParams.q ?? "";

  const { courses, total, pages } = await getCourses({ page, search });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
            Courses
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {total} course{total !== 1 ? "s" : ""} total
          </p>
        </div>

        {(role === "INSTRUCTOR" || role === "ADMIN") && (
          <Link
            href="/courses/new"
            className="flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" />
            New Course
          </Link>
        )}
      </div>

      {/* Search */}
      <form method="GET">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            name="q"
            defaultValue={search}
            placeholder="Search courses…"
            className="w-full rounded-md border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-white"
          />
        </div>
      </form>

      {/* Grid */}
      {courses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 py-16 text-center dark:border-zinc-800">
          <BookOpen className="mx-auto h-8 w-8 text-zinc-300" />
          <p className="mt-2 text-sm text-zinc-400">No courses found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="group rounded-xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h2 className="font-semibold text-zinc-900 group-hover:text-zinc-700 dark:text-white dark:group-hover:text-zinc-300">
                {course.title}
              </h2>
              {course.description && (
                <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                  {course.description}
                </p>
              )}
              <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
                <span>By {course.instructor.name ?? "Unknown"}</span>
                <span>
                  {course._count.projects} project
                  {course._count.projects !== 1 ? "s" : ""}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`?page=${p}${search ? `&q=${search}` : ""}`}
              className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                p === page
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}