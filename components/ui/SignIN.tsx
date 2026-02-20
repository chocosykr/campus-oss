"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function SignIN() {
  const { data: session } = useSession();
  if (session) return <button onClick={() => signOut()}>Sign out</button>;
  return <button onClick={() => signIn("github")}>Sign in</button>;
}
