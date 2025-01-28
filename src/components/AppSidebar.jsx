// import { Calendar, Home, Inbox, LogOut, Search, Settings } from "lucide-react"
// import { Dialog, DialogContent, DialogTitle, VisuallyHidden } from "@radix-ui/react-dialog";
// import { FaArrowRightFromBracket } from "react-icons/fa6";

// import {
//     Sidebar,
//     SidebarContent,
//     SidebarGroup,
//     SidebarGroupContent,
//     SidebarGroupLabel,
//     SidebarMenu,
//     SidebarMenuButton,
//     SidebarMenuItem,
// } from "@/components/ui/sidebar"

// // Menu items.
// const items = [
//     {
//         title: "Home",
//         url: "/",
//         icon: Home,
//     },
//     {
//         title: "Contact",
//         url: "/contact",
//         icon: Inbox,
//     },
//     {
//         title: "Appointment",
//         url: "/appointment",
//         icon: Calendar,
//     },
//     {
//         title: "Search",
//         url: "#",
//         icon: Search,
//     },
//     {
//         title: "Settings",
//         url: "#",
//         icon: Settings,
//     },
//     {
//         title: "Logout",
//         url: "#",
//         icon: LogOut

//     },

// ]

// export function AppSidebar() {
//     return (
//         <Sidebar>
//             <SidebarContent>
//                 <SidebarGroup>
//                     <SidebarGroupLabel>Application</SidebarGroupLabel>
//                     <SidebarGroupContent>
//                         <SidebarMenu>
//                             {items.map((item) => (
//                                 <SidebarMenuItem key={item.title}>
//                                     <SidebarMenuButton asChild>
//                                         <a href={item.url}>
//                                             <item.icon />
//                                             <span>{item.title}</span>
//                                         </a>
//                                     </SidebarMenuButton>
//                                 </SidebarMenuItem>
//                             ))}
//                         </SidebarMenu>
//                     </SidebarGroupContent>
//                 </SidebarGroup>
//             </SidebarContent>
//         </Sidebar>
//     )
// }


import { Calendar, Home, Inbox, LogOut, Search, Settings } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
    {
        title: "Home",
        url: "/",
        icon: Home,
    },
    {
        title: "Contact",
        url: "/contact",
        icon: Inbox,
    },
    {
        title: "Appointment",
        url: "/appointment",
        icon: Calendar,
    },
    {
        title: "Search",
        url: "#",
        icon: Search,
    },
    {
        title: "Settings",
        url: "#",
        icon: Settings,
    },
    {
        title: "Logout",
        url: "#",
        icon: LogOut,
    },
];

export function AppSidebar() {
    return (
       
         <Sidebar className="bg-sidebar-background text-sidebar-foreground pt-6">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        <img className="" src="assets/logo.png" />
                    </SidebarGroupLabel>
                    <div className="mt-5">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                //padding top change for each item
                                <SidebarMenuItem className="pt-7" key={item.title}> 
                                    <SidebarMenuButton asChild>
                                        <a
                                            href={item.url}
                                            className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-hover hover:text-hover-foreground transition-colors"
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span className="text-xl">{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>

                    </div>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>

    );
}
