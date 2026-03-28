"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { nanoid } from "nanoid";

export type CourseFormState = { error?: string };

// ─────────────────────────────
// Create Course
// ─────────────────────────────
export async function createCourseAction(
  _prev: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin");
    return {};
  }

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  if (role !== "INSTRUCTOR" && role !== "ADMIN") {
    return { error: "Only instructors can create courses." };
  }

  const rawTitle = formData.get("title");
  const rawDesc = formData.get("description");

  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
  const description = typeof rawDesc === "string" ? rawDesc.trim() : "";

  if (!title) return { error: "Title required." };

  let course;

  for (let i = 0; i < 3; i++) {
    const joinCode = nanoid(8).toUpperCase();

    try {
      course = await prisma.course.create({
        data: {
          title,
          description: description || null,
          instructorId: userId,
          joinCode,
        },
      });

      await prisma.activityLog.create({
        data: {
          userId,
          action: "created_course",
          metadata: { courseId: course.id },
        },
      });

      break;
    } catch (e: any) {
      if (e.code !== "P2002") throw e;
      if (i === 2) throw e;
    }
  }

  revalidatePath("/courses");
  redirect(`/courses/${course!.id}`);
  return {};
}

// ─────────────────────────────
// Delete Course
// ─────────────────────────────
export async function deleteCourseAction(
  courseId: string
): Promise<{ error?: string }> {

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin");
    return {};
  }

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) return { error: "Course not found." };

  if (course.instructorId !== userId && role !== "ADMIN") {
    return { error: "Not authorized." };
  }

  await prisma.course.delete({
    where: { id: courseId },
  });

  revalidatePath("/courses");
  redirect("/courses");
  return {};
}

// ─────────────────────────────
// Enroll in Course
// ─────────────────────────────
export async function enrollInCourseAction(
  _prev: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin");
    return {};
  }

  const userId = (session.user as any).id;

  const raw = formData.get("joinCode");
  const joinCode = typeof raw === "string" ? raw.trim().toUpperCase() : "";

  if (!joinCode) return { error: "Join code required." };

  const course = await prisma.course.findUnique({
    where: { joinCode },
  });

  if (!course) return { error: "Invalid join code." };

  const existing = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId: course.id },
    },
  });

  if (existing) return { error: "Already enrolled." };

  await prisma.enrollment.create({
    data: { userId, courseId: course.id },
  });

  await prisma.activityLog.create({
    data: {
      userId,
      action: "enrolled_in_course",
      metadata: { courseId: course.id },
    },
  });

  revalidatePath("/courses");
  revalidatePath("/dashboard");
  redirect(`/courses/${course.id}`);
  return {};
}