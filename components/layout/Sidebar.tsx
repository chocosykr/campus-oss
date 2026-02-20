"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = (role: string) => [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["STUDENT", "INSTRUCTOR", "ADMIN"] },
  { href: "/courses", label: "Courses", icon: BookOpen, roles: ["STUDENT", "INSTRUCTOR", "ADMIN"] },
  { href: "/submissions", label: "Submissions", icon: FileText, roles: ["STUDENT", "INSTRUCTOR", "ADMIN"] },
  { href: "/admin", label: "Admin", icon: ShieldCheck, roles: ["ADMIN"] },
].filter((item) => item.roles.includes(role));

interface SidebarProps {
  role: string;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = navItems(role);

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-zinc-200 px-6 dark:border-zinc-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 dark:bg-white">
            <span className="text-xs font-bold text-white dark:text-zinc-900">C</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
            Campus OSS
          </span>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Role badge */}
      <div className="border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium capitalize text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {role.toLowerCase()}
        </span>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed left-4 top-4 z-50 rounded-md bg-white p-1.5 shadow-sm md:hidden dark:bg-zinc-900"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white transition-transform dark:bg-zinc-900 md:translate-x-0",
          open ? "translate-x-0 shadow-xl" : "-translate-x-full md:shadow-none"
        )}
      >
        <NavContent />
      </aside>
    </>
  );
}