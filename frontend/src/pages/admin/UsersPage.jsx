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
      </div>
    </div>
  );
}
