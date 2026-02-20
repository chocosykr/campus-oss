import { getCourse } from "@/actions/courses";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Calendar, FolderKanban } from "lucide-react";

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
          </div>

          {isOwner && (
            <Link
              href={`/courses/${course.id}/projects/new`}
              className="flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4" />
              New Project
            </Link>
          )}
        </div>
      </div>

      {/* Projects */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Projects ({course._count.projects})
        </h2>

        {course.projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 py-12 text-center dark:border-zinc-800">
            <FolderKanban className="mx-auto h-8 w-8 text-zinc-300" />
            <p className="mt-2 text-sm text-zinc-400">No projects yet.</p>
            {isOwner && (
              <Link
                href={`/courses/${course.id}/projects/new`}
                className="mt-3 inline-block text-sm font-medium underline text-zinc-500 hover:text-zinc-900"
              >
                Create the first project
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {course.projects.map((project) => (
              <Link
                key={project.id}
                href={`/courses/${course.id}/projects/${project.id}`}
                className="group rounded-xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <h3 className="font-medium text-zinc-900 dark:text-white">
                  {project.title}
                </h3>
                {project.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                    {project.description}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-4 text-xs text-zinc-400">
                  {project.dueDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Due {new Date(project.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  <span>{project._count.teams} teams</span>
                  <span>{project._count.submissions} submissions</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}