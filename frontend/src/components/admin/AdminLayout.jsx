// src/components/admin/AdminLayout.jsx
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
