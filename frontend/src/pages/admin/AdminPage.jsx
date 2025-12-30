import { Outlet } from "react-router-dom";
import SideBar from "@/components/admin/SideBar";
import TopBar from "@/components/admin/TopBar";

export default function AdminPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <SideBar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
