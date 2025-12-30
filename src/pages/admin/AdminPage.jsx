import { Outlet } from "react-router-dom";
import SideBar from "@/components/admin/SideBar.jsx";
import TopBar from "@/components/admin/TopBar";

export default function AdminPage() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-[192px] flex-shrink-0">
        <SideBar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
