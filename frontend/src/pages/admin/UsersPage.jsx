// src/pages/admin/UsersPage.jsx
import { useEffect, useState } from "react";
import { getUsers, setUserRole, lockUser, unlockUser, deleteUser } from "@/api/mockApi";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loadingIds, setLoadingIds] = useState(new Set());

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  const setLoading = (id, val) => {
    setLoadingIds((s) => {
      const ns = new Set(s);
      if (val) ns.add(id);
      else ns.delete(id);
      return ns;
    });
  };

  const handleRoleChange = async (id, role) => {
    setLoading(id, true);
    try {
      await setUserRole(id, role);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    } catch (err) {
      alert(err.message || 'Failed to update role');
    } finally {
      setLoading(id, false);
    }
  };

  const handleLockToggle = async (id, isActive) => {
    setLoading(id, true);
    try {
      if (isActive) {
        await lockUser(id);
      } else {
        await unlockUser(id);
      }
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: isActive ? 'Tạm khóa' : 'Hoạt động', is_active: !isActive } : u)));
    } catch (err) {
      alert(err.message || 'Failed to change status');
    } finally {
      setLoading(id, false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa người dùng này?')) return;
    setLoading(id, true);
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    } finally {
      setLoading(id, false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Người dùng</h1>

      <div className="bg-white rounded-xl shadow border">
        <table className="w-full text-left">
          <thead className="bg-teal-50 text-gray-700">
            <tr>
              <th className="px-6 py-3">Tên</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Trạng thái</th>
              <th className="px-6 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t hover:bg-teal-50 transition">
                <td className="px-6 py-4 font-medium">{u.name}</td>
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4">
                  <select
                    className="border rounded px-2 py-1"
                    defaultValue={u.role || 'customer'}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    disabled={loadingIds.has(u.id)}
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                    <option value="doctor">Doctor</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </td>
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
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 rounded bg-yellow-100 text-yellow-800"
                      onClick={() => handleLockToggle(u.id, u.is_active ?? true)}
                      disabled={loadingIds.has(u.id)}
                    >
                      {u.is_active ? 'Tạm khóa' : 'Mở khóa'}
                    </button>
                    <button
                      className="px-3 py-1 rounded bg-red-100 text-red-800"
                      onClick={() => handleDelete(u.id)}
                      disabled={loadingIds.has(u.id)}
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
import { useState, useEffect } from "react";
import { Search, MoreVertical, UserCircle2, Mail, Phone } from "lucide-react";
import { api } from "@/api/mockApi";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getUsers().then((data) => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.phone.includes(query)
    );
  });

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-[#f8fafb] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý người dùng
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý chủ nuôi và thú cưng của họ ...
          </p>
        </div>
        <div className="bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
          <p className="text-xs text-gray-600">
            Today: Thứ 3 ngày 30 tháng 12 năm 2025
          </p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm người dùng theo tên, email hoặc số điện thoại..."
              className="w-full bg-[#f0fff8] border border-gray-200 rounded-lg pl-11 pr-4 py-2.5 text-sm text-gray-700 placeholder:text-[#8aa3a2] focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100">
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  User
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Pets
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Joined
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <UserCircle2 className="size-12 text-gray-300 mb-3" />
                      <p className="text-gray-500">
                        {searchQuery
                          ? "No users found matching your search"
                          : "No users found"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* User Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-gradient-to-br from-teal-300 to-emerald-300 flex items-center justify-center flex-shrink-0">
                          <UserCircle2 className="size-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Pets Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <svg
                          className="size-4 text-gray-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-sm text-gray-700">
                          {user.pets.join(", ")} ({user.pets.length})
                        </span>
                      </div>
                    </td>

                    {/* Contact Column */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Mail className="size-3.5" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Phone className="size-3.5" />
                          <span>{user.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Joined Column */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {new Date(user.joinDate).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button className="p-1 rounded hover:bg-gray-100 transition-colors">
                          <MoreVertical className="size-5 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer - Optional: Add pagination or stats */}
        {filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <p className="text-sm text-gray-600">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
