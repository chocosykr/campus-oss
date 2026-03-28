import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 12;

// ─────────────────────────────
// Courses created by instructor
// ─────────────────────────────
export async function getInstructorCourses(
{
  userId,
  page = 1,
  search = ""
}: {
  userId?: string
  page?: number
  search?: string
}) {
  const where = {
    instructorId: userId,
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      include: {
        instructor: { select: { id: true, name: true, image: true } },
        _count: { select: { assignments: true, enrollments: true } },
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

// ─────────────────────────────
// Courses student enrolled in
// ─────────────────────────────
export async function getStudentCourses({
  userId,
  page = 1,
  search = ""
}: {
  userId?: string
  page?: number
  search?: string
}) {

  const where = {
    enrollments: {
      some: { userId },
    },
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      include: {
        instructor: { select: { id: true, name: true, image: true } },
        _count: { select: { assignments: true, enrollments: true } },
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

// ─────────────────────────────
// Single course detail
// ─────────────────────────────
export async function getCourse(id: string) {

  return prisma.course.findUnique({
    where: { id },
    include: {
      instructor: {
        select: { id: true, name: true, image: true, email: true },
      },
      assignments: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { submissions: true } },
        },
      },
      _count: {
        select: {
          assignments: true,
          enrollments: true,
        },
      },
    },
  });
}