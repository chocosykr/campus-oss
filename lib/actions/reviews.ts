"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Adjust to your auth path
import { revalidatePath } from "next/cache";

export async function submitReview(
  submissionId: string, 
  courseId: string, 
  assignmentId: string, 
  formData: FormData
) {
  const session = await getServerSession(authOptions);
  
  // Security check: Ensure only instructors can grade
  if (!session?.user || session.user.role !== "INSTRUCTOR") {
    return { error: "Unauthorized. Only instructors can submit reviews." };
  }

  const score = parseInt(formData.get("score") as string, 10);
  const comment = formData.get("comment") as string;

  try {
    // 1. Create the review record
    await prisma.review.create({
      data: {
        submissionId,
        reviewerId: session.user.id,
        score,
        comment,
      }
    });

    // 2. Update the submission status to REVIEWED
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: "REVIEWED" }
    });

    // 3. Clear cache to show updated data
    revalidatePath(`/courses/${courseId}/assignments/${assignmentId}/review/${submissionId}`);
    revalidatePath(`/courses/${courseId}/assignments/${assignmentId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to submit review:", error);
    return { error: "Failed to save the review." };
  }
}