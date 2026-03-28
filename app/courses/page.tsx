import { getInstructorCourses, getStudentCourses } from "@/lib/queries/courses";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, BookOpen, Users, Code } from "lucide-react";
import SearchInput from "@/components/courses/search-input";

interface CoursesPageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  const { page: pageParam, q } = await searchParams;  // await here

  const role = (session.user as any).role;
  const userId = (session.user as any).id as string;

  const page = Number.parseInt(pageParam ?? "1", 10) || 1;
  const search = q ?? "";
  
  // rest stays the same...

  // choose appropriate query based on role
  const data =
    role === "INSTRUCTOR" || role === "ADMIN"
      ? await getInstructorCourses({userId, page, search})
      : await getStudentCourses({userId, page, search});

  const { courses, total, pages } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
            Courses
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {total} course{total !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex gap-2">
          {role === "STUDENT" && (
            <Link
              href="/courses/enroll-course"
              className="flex items-center gap-2 rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
            >
              Join with Code
            </Link>
          )}

          {(role === "INSTRUCTOR" || role === "ADMIN") && (
            <Link
              href="/courses/new"
              className="flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4" />
              New Course
            </Link>
          )}
        </div>
      </div>

      <SearchInput defaultValue={search} />

      {courses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 py-16 text-center dark:border-zinc-800">
          <BookOpen className="mx-auto h-8 w-8 text-zinc-300" />
          <p className="mt-2 text-sm text-zinc-400">
            No courses found matching your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course: any) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="group flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div>
                <h2 className="font-semibold text-zinc-900 group-hover:text-zinc-700 dark:text-white dark:group-hover:text-zinc-300">
                  {course.title}
                </h2>
                {course.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                    {course.description}
                  </p>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                    {course.instructor?.name?.charAt(0) || "U"}
                  </div>
                  <span className="text-xs text-zinc-500 truncate max-w-25">
                    {course.instructor?.name || "Instructor"}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-zinc-400">
                  <div className="flex items-center gap-1">
                    <Code className="h-3 w-3" />
                    <span className="text-xs font-medium">
                      {course._count?.assignments ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span className="text-xs font-medium">
                      {course._count?.enrollments ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`?page=${p}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
              className={`flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors ${
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