// src/components/admin/TopBar.jsx
import { Bell, Search } from "lucide-react";

export default function TopBar() {
  return (
    <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
      <div className="relative w-96">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          placeholder="Search patients, appointments, doctors..."
          className="w-full pl-10 pr-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
        />
      </div>

      <div className="flex items-center gap-4">
        <Bell className="text-gray-500" />
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-teal-200 flex items-center justify-center font-semibold">
            A
          </div>
          <div className="text-sm">
            <p className="font-medium">Dr. Admin</p>
            <p className="text-gray-400 text-xs">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}
