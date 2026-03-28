"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function enrollCourse(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const joinCode = formData.get("joinCode") as string;

  const course = await prisma.course.findUnique({
    where: { joinCode },
    select: { id: true },
  });

  if (!course) {
    throw new Error("Invalid join code");
  }

  const existing = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId: course.id },
    },
  });

  if (existing) {
    redirect(`/courses/${course.id}`);
  }

  await prisma.enrollment.create({
    data: {
      userId,
      courseId: course.id,
    },
  });

  redirect(`/courses/${course.id}`);
}