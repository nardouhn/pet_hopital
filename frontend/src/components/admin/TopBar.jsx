// src/components/admin/TopBar.jsx
import { Bell, Search, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TopBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("auth");
    navigate("/");
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between gap-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-[504px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients, appointments, doctors..."
              className="w-full bg-gray-50 border border-gray-200 rounded-full pl-10 pr-4 py-2.5 text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <button className="relative p-1.5 rounded-full hover:bg-gray-50 transition-colors">
            <Bell className="size-5 text-gray-600" />
            <span className="absolute top-1 right-1 size-2 bg-pink-400 rounded-full border-2 border-white"></span>
          </button>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">Dr. Admin</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <div className="size-10 rounded-full bg-gradient-to-br from-teal-300 to-emerald-300 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">DA</span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-red-50 transition-colors group"
            title="Logout"
          >
            <LogOut className="size-5 text-gray-600 group-hover:text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
