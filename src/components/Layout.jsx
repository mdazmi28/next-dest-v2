import React from 'react';
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const Layout = ({children}) => {
    return (
        
            <div className="h-screen">
               
                    <SidebarProvider>
                        <AppSidebar />
                        <SidebarInset>
                            <div className="flex flex-col">
                                <SidebarTrigger className="-ml-1 fixed" />
                                <Separator orientation="vertical" className="mr-2 h-4" />
                            </div>
                            <div className="p-4">
                                {children}
                            </div>
                        </SidebarInset>
                    </SidebarProvider>
              

            </div>
        
    );
};

export default Layout;