import { useState, useEffect } from "react";
import { Search, MoreVertical, UserCircle2, Mail, Phone, Lock, Unlock, UserCheck, Trash2 } from "lucide-react";
import { getUsers, setUserRole, lockUser, unlockUser, deleteUser } from "@/api/mockApi";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSetRole = async (userId, role) => {
    try {
      await setUserRole(userId, role);
      await fetchUsers(); // Refresh
    } catch (error) {
      console.error('Error setting role:', error);
    }
  };

  const handleLockUser = async (userId) => {
    try {
      await lockUser(userId);
      await fetchUsers();
    } catch (error) {
      console.error('Error locking user:', error);
    }
  };

  const handleUnlockUser = async (userId) => {
    try {
      await unlockUser(userId);
      await fetchUsers();
    } catch (error) {
      console.error('Error unlocking user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        await fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

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
                          {Array.isArray(user.pets) ? user.pets.map(p => p.name || p).join(", ") : user.pets} ({Array.isArray(user.pets) ? user.pets.length : user.pets})
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
                        {user.joinDate ? new Date(user.joinDate).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }) : 'N/A'}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button 
                          onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                          className="p-1 rounded hover:bg-gray-100 transition-colors"
                        >
                          <MoreVertical className="size-5 text-gray-600" />
                        </button>
                        {openDropdown === user.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                            <div className="py-1">
                              <button 
                                onClick={() => { handleSetRole(user.id, 'admin'); setOpenDropdown(null); }}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                              >
                                <UserCheck className="size-4 mr-2" />
                                Set as Admin
                              </button>
                              <button 
                                onClick={() => { handleSetRole(user.id, 'customer'); setOpenDropdown(null); }}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                              >
                                <UserCircle2 className="size-4 mr-2" />
                                Set as Customer
                              </button>
                              {user.is_active ? (
                                <button 
                                  onClick={() => { handleLockUser(user.id); setOpenDropdown(null); }}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                                >
                                  <Lock className="size-4 mr-2" />
                                  Lock Account
                                </button>
                              ) : (
                                <button 
                                  onClick={() => { handleUnlockUser(user.id); setOpenDropdown(null); }}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                                >
                                  <Unlock className="size-4 mr-2" />
                                  Unlock Account
                                </button>
                              )}
                              <button 
                                onClick={() => { handleDeleteUser(user.id); setOpenDropdown(null); }}
                                className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-gray-100 w-full"
                              >
                                <Trash2 className="size-4 mr-2" />
                                Delete User
                              </button>
                            </div>
                          </div>
                        )}
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