"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createAssignment(courseId: string, formData: FormData) {
  const title = formData.get("title")?.toString()
  const description = formData.get("description")?.toString()
  const language = formData.get("language")?.toString()
  const starterCode = formData.get("starterCode")?.toString()

  const dueDateRaw = formData.get("dueDate")?.toString()
  const dueDate = dueDateRaw ? new Date(dueDateRaw) : null

  await prisma.assignment.create({
    data: {
      title: title!,
      description,
      language: language!,
      starterCode,
      dueDate,
      courseId,
    },
  })

  revalidatePath(`/courses/${courseId}`)
}

// Action to edit the main assignment details
export async function updateAssignment(assignmentId: string, formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const dueDate = formData.get("dueDate") as string;

  await prisma.assignment.update({
    where: { id: assignmentId },
    data: {
      title,
      description,
      // Only parse the date if one was provided
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  revalidatePath(`/courses/[id]/assignments/${assignmentId}`, "page");
  return { success: true };
}

// Action to add a new test case
export async function addTestCase(assignmentId: string, formData: FormData) {
  const input = formData.get("input") as string;
  const expectedOutput = formData.get("expectedOutput") as string;
  const hidden = formData.get("hidden") === "on"; // Checkboxes return "on" if checked

  await prisma.testCase.create({
    data: {
      assignmentId,
      input,
      expectedOutput,
      hidden,
    },
  });

  revalidatePath(`/courses/[id]/assignments/${assignmentId}`, "page");
  return { success: true };
}