import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { getOverviewStats, getRecentAppointments } from "@/api/mockApi";

export default function Overview() {
  const [stats, setStats] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [s, a] = await Promise.all([
        getOverviewStats(),
        getRecentAppointments(),
      ]);
      setStats(s);
      setAppointments(a);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return <p className="text-center">Đang tải dữ liệu...</p>;
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Tổng quan</h1>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {stats.map((item) => (
          <div key={item.title} className="bg-white p-5 rounded-xl shadow">
            <p className="text-sm text-gray-500">{item.title}</p>
            <p className="text-xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold mb-4">Lịch hẹn gần đây</h2>
        {appointments.map((a, i) => (
          <p key={i} className="text-sm">
            🐾 {a.pet} – {a.owner} ({a.time})
          </p>
        ))}
      </div>
    </AdminLayout>
  );
}
