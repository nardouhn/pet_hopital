// src/pages/admin/UsersPage.jsx
import { useEffect, useState } from "react";
import { getUsers } from "@/api/mockApi";

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Người dùng</h1>

      <div className="bg-white rounded-xl shadow border">
        <table className="w-full text-left">
          <thead className="bg-teal-50 text-gray-700">
            <tr>
              <th className="px-6 py-3">Tên</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t hover:bg-teal-50 transition">
                <td className="px-6 py-4 font-medium">{u.name}</td>
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      u.status === "Hoạt động"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
