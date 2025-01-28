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
              <div
            className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
            {/* Logo */}
            <img
              className="w-16 h-16 object-contain "
              src="assets/side_logo.png"
              alt="Logo"
            />
          </div>
          <img
            className="w-40 h-40 object-contain p-2"
            src="assets/logo.png"
            alt="Logo"
          />

            </SidebarMenuButton>
          </DropdownMenuTrigger>
         
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>)
  );
}
