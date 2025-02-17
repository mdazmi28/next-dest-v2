"use client"
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items
}) {
  return (
    (<SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  className="hover:bg-[#0BBFBF] mb-2"
                  tooltip={item.title}
                >
                  <Link
                    href={item.url}
                    className="flex items-center gap-3 w-full"
                  >
                    <img
                      src={item.icon}
                      alt={item.title}
                      className="w-5 h-5"
                    />
                    <span className="">
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>

              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>)
  );
}
