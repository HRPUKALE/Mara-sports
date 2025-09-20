import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { InstitutionSidebar } from "@/components/InstitutionSidebar";
import { InstitutionHeader } from "@/components/InstitutionHeader";

const InstitutionLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <InstitutionSidebar />
        <div className="flex-1 flex flex-col">
          <InstitutionHeader />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default InstitutionLayout;