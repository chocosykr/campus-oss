"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@/generated/prisma";
import { redirect } from "next/navigation";

export type SignupState = {
  error?: string;
  success?: boolean;
};

export async function signupAction(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = (formData.get("role") as Role) ?? "STUDENT";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (!["STUDENT", "INSTRUCTOR"].includes(role)) {
    return { error: "Invalid role." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, password: hashed, role },
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "signed_up",
      metadata: { provider: "credentials", role },
    },
  });

  redirect("/auth/signin?registered=true");
}