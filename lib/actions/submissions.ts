"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function submitCode(assignmentId: string, code: string, language: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { error: "You must be logged in to submit code." };
    }

    // 1. ADD THIS DEBUG LOG to see what is missing
    console.log("[DEBUG submitCode] Incoming data:", {
      userId: session.user.id,
      assignmentId,
      codeHasLength: code?.length,
      language
    });

    // Replace the upsert with this:
    const existing = await prisma.submission.findUnique({
      where: {
        userId_assignmentId: {
          userId: session.user.id,
          assignmentId,
        },
      },
    });

    let submission;
    if (existing) {
      submission = await prisma.submission.update({
        where: { id: existing.id },
        data: {
          code,
          language,
          status: 'PENDING',
        },
      });
    } else {
      submission = await prisma.submission.create({
        data: {
          userId: session.user.id,
          assignmentId,
          code,
          language,
          status: 'PENDING',
        },
      });
    }

    // Push job to execution queue
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

    revalidatePath(`/courses/[id]/assignments/${assignmentId}`, 'page');

    return { success: true, submissionId: submission.id };

  } catch (error: any) {
    console.error("Submission error:", error);
    console.error("Submission error meta:", JSON.stringify(error?.meta, null, 2));
    return { error: "Failed to submit code. Please try again." };
  }
}
