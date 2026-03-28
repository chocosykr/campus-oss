import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Adjust this import path to your auth config
import { redirect } from "next/navigation";
import InstructorView from "@/app/courses/[id]/assignments/[assignmentId]/_components/InstructorView";
import { StudentWorkspace } from "@/app/courses/[id]/assignments/[assignmentId]/_components/StudentWorkspace";

interface PageProps {
  params: Promise<{
    id: string; // courseId
    assignmentId: string;
  }>
}

export default async function AssignmentPage({ params }: PageProps) {
  // 1. Resolve params and get the current user session
  const { assignmentId, id: courseId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userRole = session.user.role; // Assuming you added 'role' to the session callback

  // 2. Fetch data conditionally based on role to protect hidden data
  // Inside page.tsx
  const assignment = await prisma.assignment.findUnique({
    where: {
      id: assignmentId
    },
    include: {
      testCases: userRole === "INSTRUCTOR"
        ? true
        : { where: { hidden: false } },

      // UPDATE THIS BLOCK to include reviews
      submissions: userRole === "INSTRUCTOR"
        ? { include: { user: true, reviews: true }, orderBy: { createdAt: 'desc' } }
        : { where: { userId: session.user.id }, include: { reviews: true }, orderBy: { createdAt: 'desc' } },
    },
  });

  if (!assignment) return <div>Assignment not found</div>;

  // 3. Shared Header UI (Both roles need to see what the assignment is)
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <header className="border-b pb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{assignment.title}</h1>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
            {assignment.language}
          </span>
        </div>

        <p className="mt-4 text-zinc-600 whitespace-pre-wrap">{assignment.description}</p>

        {assignment.dueDate && (
          <div className="mt-4 text-sm font-medium text-red-600">
            Due: {new Date(assignment.dueDate).toLocaleString()}
          </div>
        )}
      </header>

      {/* 4. Conditional Rendering for Role-Specific Features */}
      {userRole === "INSTRUCTOR" ? (
        <InstructorView assignment={assignment} courseId={courseId} />
      ) : (
        <StudentWorkspace assignment={assignment} />
      )}
    </div>
  );
}
