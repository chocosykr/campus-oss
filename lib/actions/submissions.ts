"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Adjust path if needed
import { revalidatePath } from "next/cache";

export async function submitCode(assignmentId: string, code: string, language: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { error: "You must be logged in to submit code." };
    }

    // 1. Create the submission in the database
    const submission = await prisma.submission.create({
      data: {
        userId: session.user.id,
        assignmentId,
        code,
        language,
        status: "PENDING", // Initial status before Judge0 runs
      }
    });

    // 2. Push job to execution queue
    const workerRes = await fetch(`${process.env.WORKER_URL}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submissionId: submission.id,
        code,
        language,
      }),
    });

    if (!workerRes.ok) {
      console.error('[submitCode] Worker rejected job:', await workerRes.text());
    }

    // 3. Tell Next.js to clear the cache for this route so the new submission shows up
    revalidatePath(`/courses/[id]/assignments/${assignmentId}`, 'page');

    return { success: true, submissionId: submission.id };

  } catch (error) {
    console.error("Submission error:", error);
    return { error: "Failed to submit code. Please try again." };
  }
}