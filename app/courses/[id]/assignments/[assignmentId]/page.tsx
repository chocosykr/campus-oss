import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import InstructorView from "@/app/courses/[id]/assignments/[assignmentId]/_components/InstructorView";
import { StudentWorkspace } from "@/app/courses/[id]/assignments/[assignmentId]/_components/StudentWorkspace";
import { Calendar, Code2, FileWarning, ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{
    id: string;
    assignmentId: string;
  }>
}

const LANG_COLORS: Record<string, string> = {
  python:     "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  javascript: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
  java:       "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  cpp:        "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/10 dark:text-zinc-400",
};

export default async function AssignmentPage({ params }: PageProps) {
  const { assignmentId, id: courseId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userRole = session.user.role;

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      testCases: userRole === "INSTRUCTOR"
        ? true
        : { where: { hidden: false } },
      submissions: userRole === "INSTRUCTOR"
        ? { include: { user: true, reviews: true }, orderBy: { createdAt: 'desc' } }
        : { where: { userId: session.user.id }, include: { reviews: true }, orderBy: { createdAt: 'desc' } },
    },
  });

  if (!assignment) {
    return (
      <div className="mx-auto max-w-2xl py-20">
        <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
            <FileWarning className="h-6 w-6 text-zinc-400" />
          </div>
          <h3 className="mt-4 text-sm font-medium text-zinc-900 dark:text-white">Assignment not found</h3>
          <p className="mt-1 text-xs text-zinc-400">This assignment may have been removed or the link is incorrect.</p>
        </div>
      </div>
    );
  }

  const langKey = assignment.language?.toLowerCase() || "";
  const langStyle = LANG_COLORS[langKey] ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      {/* Navigation */}
      <nav>
        <Link 
          href={`/courses/${courseId}`}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Course
        </Link>
      </nav>

      {/* Page Header */}
      <header className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
              {assignment.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${langStyle}`}>
                <Code2 className="h-3 w-3" />
                {assignment.language}
              </span>
              
              {assignment.dueDate && (
                <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                  Due {new Date(assignment.dueDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
            {assignment.description}
          </p>
        </div>
      </header>

      {/* Main Action Area */}
      <div className="space-y-8">
        {userRole === "INSTRUCTOR" ? (
          <InstructorView assignment={assignment} courseId={courseId} />
        ) : (
          <StudentWorkspace assignment={assignment} />
        )}
      </div>
    </div>
  );
}