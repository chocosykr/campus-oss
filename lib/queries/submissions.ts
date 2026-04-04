import { prisma } from '@/lib/prisma'

export async function getSubmissions(userId: string, role: string) {
  if (role === "INSTRUCTOR") {
    // Fetch submissions for all courses where the user is the instructor
    return prisma.submission.findMany({
      where: {
        assignment: {
          course: { instructorId: userId }
        }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: true, // Instructor needs to see WHO submitted
        assignment: {
          include: {
            course: { select: { title: true, id: true } }
          }
        }
      }
    })
  }

  // Default Student View
  return prisma.submission.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      assignment: {
        include: {
          course: { select: { title: true, id: true } }
        }
      }
    }
  })
}