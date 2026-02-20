"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ── Create ────────────────────────────────────────────────────────────────────

export type CourseFormState = { error?: string };

export async function createCourseAction(
  _prev: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  const role = (session.user as any).role;
  if (role !== "INSTRUCTOR" && role !== "ADMIN") {
    return { error: "Only instructors can create courses." };
  }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();

  if (!title) return { error: "Title is required." };

  const course = await prisma.course.create({
    data: {
      title,
      description: description || null,
      instructorId: (session.user as any).id,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: (session.user as any).id,
      action: "created_course",
      metadata: { courseId: course.id, title },
    },
  });

  revalidatePath("/courses");
  redirect(`/courses/${course.id}`);
}

// ── List (paginated) ──────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

export async function getCourses({
  page = 1,
  search = "",
}: {
  page?: number;
  search?: string;
}) {
  const where = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      include: {
        instructor: { select: { id: true, name: true, image: true } },
        _count: { select: { projects: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.course.count({ where }),
  ]);

  return {
    courses,
    total,
    pages: Math.ceil(total / PAGE_SIZE),
    page,
  };
}

// ── Detail ────────────────────────────────────────────────────────────────────

export async function getCourse(id: string) {
  return prisma.course.findUnique({
    where: { id },
    include: {
      instructor: { select: { id: true, name: true, image: true, email: true } },
      projects: {
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { teams: true, submissions: true } } },
      },
      _count: { select: { projects: true } },
    },
  });
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteCourseAction(courseId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return { error: "Course not found." };

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  if (course.instructorId !== userId && role !== "ADMIN") {
    return { error: "Not authorized." };
  }

  await prisma.course.delete({ where: { id: courseId } });
  revalidatePath("/courses");
  redirect("/courses");
}