"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,

  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { TeamSwitcher } from "@/components/team-switcher"
import { MdDashboard } from "react-icons/md";
import { FcContacts } from "react-icons/fc";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
   
  
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: "/assets/icons/dashboard.png",
      isActive: false,
    },
    {
      title: "Contact",
      url: "/contact",
      icon: "/assets/icons/contact.png",
    },
    {
      title: "Appointment",
      url: "/appointment",
      icon: "/assets/icons/schedule.png",
    },
    {
      title: "Dispatch",
      url: "/dispatch",
      icon: "/assets/icons/letter.png",

    },
    {
      title: "Attachment",
      url: "/attachment",
      icon: "/assets/icons/attachment.png",

    },
  ],

}

export function AppSidebar({
  ...props
}) {
  return (
    (<Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        {/* <NavUser user={data.user} /> */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>)
  );
}
