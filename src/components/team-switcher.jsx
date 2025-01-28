"use client"

import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function TeamSwitcher({
  teams
}) {
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

  return (
    (<SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <img
                className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground" src="assets/logo.png"/>
                {/* logo */}
                {/* <activeTeam.logo className="size-4" /> */}
                {/* <img className="" src="assets/logo.png" /> */}
              {/* </img> */}
              <img className="fill-none" src="assets/logo.png" />

            </SidebarMenuButton>
          </DropdownMenuTrigger>
         
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>)
  );
}
