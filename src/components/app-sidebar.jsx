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

const handleLogout = () => {
  localStorage.removeItem('authToken')
  // localStorage.removeItem('authToken')
  location.replace("/")
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
        <div className="flex justify-start items-center flex-row gap-3 cursor-pointer  hover:shadow-xl hover:scale-105 duration-300">
          <img
            src="assets/icons/logout.png"
            // alt={item.title}
            className="w-10 h-10 "
            onClick={handleLogout}
          />
          <h1 className="font-bold">Logout</h1>
          </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>)
  );
}
