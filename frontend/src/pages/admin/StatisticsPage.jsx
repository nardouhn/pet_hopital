import { useEffect, useState } from "react";
import { getOverviewStats } from "@/api/mockApi";

export default function StatisticsPage() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const s = await getOverviewStats();
        setStats(s);
      } catch (err) {
        if (err.message.includes('Please login first')) {
          setError('Session expired. Please login again.');
        } else {
          setStats([
            { title: "Tổng thú cưng", value: 0 },
            { title: "Người dùng", value: 0 },
            { title: "Lịch hôm nay", value: 0 },
            { title: "Doanh thu", value: "₫0" },
          ]);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return <p className="text-center">Đang tải dữ liệu...</p>;
  }

  return (
    <div className="p-6">
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <h1 className="text-2xl font-bold mb-6">Thống kê</h1>
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((item) => (
          <div key={item.title} className="bg-white p-5 rounded-xl shadow">
            <p className="text-sm text-gray-500">{item.title}</p>
            <p className="text-xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}