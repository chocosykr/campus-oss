// components/layout/AppShell.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default async function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar role={(session?.user as any)?.role ?? "STUDENT"} />

      <div className="flex flex-1 flex-col md:pl-64">
        <Topbar user={session?.user} />
        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}