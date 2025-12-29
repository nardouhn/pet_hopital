// src/components/Sidebar.jsx
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  PawPrint,
  Calendar,
  Activity,
  FileText,
  Package,
  Hotel,
  BarChart3,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menu = [
  { name: "Tổng quan", icon: LayoutDashboard, path: "/admin" },
  { name: "Người dùng", icon: Users, path: "/admin/users" },
  { name: "Bác sĩ", icon: Stethoscope, path: "/admin/doctors" },
  { name: "Thú cưng", icon: PawPrint, path: "/admin/pets" },
  { name: "Lịch hẹn", icon: Calendar, path: "/admin/appointments" },
  { name: "Lượt khám", icon: Activity, path: "/admin/visits" },
  { name: "Hồ sơ bệnh án", icon: FileText, path: "/admin/records" },
  { name: "Dịch vụ", icon: Package, path: "/admin/services" },
  { name: "Khách sạn thú cưng", icon: Hotel, path: "/admin/hotel" },
  { name: "Thống kê", icon: BarChart3, path: "/admin/statistics" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-white border-r shadow-sm flex flex-col">
      {/* Logo */}
      <div className="p-6 bg-gradient-to-br from-teal-200 to-teal-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            ❤️
          </div>
          <div>
            <h2 className="font-bold text-teal-800">Petorium</h2>
            <p className="text-xs text-gray-600">Vet Clinic Admin</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
              ${
                isActive
                  ? "bg-teal-100 text-teal-700 shadow"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 m-4 rounded-xl bg-gradient-to-r from-teal-100 to-teal-200 text-xs text-teal-700">
        🐾 Caring for pets with love
      </div>
    </aside>
  );
}
