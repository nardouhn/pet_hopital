// src/components/admin/AdminLayout.jsx
// NOTE: AdminPage (route-level) provides the sidebar & topbar layout. Avoid nesting AdminLayout
// inside the /admin route to prevent duplicate sidebars; prefer using route <AdminPage /> with <Outlet />.
import SideBar from "./SideBar";
import TopBar from "./TopBar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <SideBar />

      <div className="flex-1 flex flex-col">
        <TopBar />

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
