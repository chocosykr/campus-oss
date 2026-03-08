"use client"

import * as React from "react"
import {
  BookOpen,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  GalleryVerticalEnd,
} from "lucide-react"
import { useSession } from "next-auth/react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    items: [],
  },
  {
    title: "Courses",
    url: "/courses",
    icon: BookOpen,
    items: [],
  },
  {
    title: "Submissions",
    url: "/submissions",
    icon: FileText,
    items: [],
  },
]

const adminItem = {
  title: "Admin",
  url: "/admin",
  icon: ShieldCheck,
  items: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const user = session?.user as any
  const role = user?.role ?? "STUDENT"

  const nav = role === "ADMIN" ? [...navItems, adminItem] : navItems

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                  <GalleryVerticalEnd className="h-4 w-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Campus OSS</span>
                  <span className="text-xs capitalize text-muted-foreground">
                    {role.toLowerCase()}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={nav} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name ?? "User",
            email: user?.email ?? "",
            avatar: user?.image ?? "",
          }}
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}