import { prisma } from '@/lib/prisma'

export async function getInstructorDashboard(userId: string) {
  const [courseCount, recentCourses, submissionCount] = await Promise.all([
    prisma.course.count({
      where: { instructorId: userId }
    }),
    
    prisma.course.findMany({
      where: { instructorId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        instructor: { select: { name: true } },
        _count: { select: { assignments: true } }
      },
    }),

    prisma.submission.count({
      where: {
        assignment: {
          course: { instructorId: userId }
        }
      }
    })
  ])

  return { courseCount, recentCourses, submissionCount }
}

export async function getStudentDashboard(userId: string) {
  const [enrollmentCount, enrollments, submissionCount] = await Promise.all([
    prisma.enrollment.count({
      where: { userId }
    }),

    prisma.enrollment.findMany({
      where: { userId },
      orderBy: { enrolledAt: "desc" },
      take: 5,
      include: {
        course: {
          include: {
            instructor: { select: { name: true } },
            _count: { select: { assignments: true } }
          }
        }
      }
    }),

    prisma.submission.count({
      where: { userId }
    })
  ])

  // Transform enrollments to match instructor dashboard shape
const recentCourses = enrollments.map((e: any) => e.course)
  return { 
    courseCount: enrollmentCount, 
    recentCourses,
    submissionCount 
  }
}