// src/pages/admin/DoctorsPage.jsx
import { useEffect, useState } from "react";
import { getAdminDoctors } from "@/api/mockApi";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetch() {
      setLoading(true);
      const data = await getAdminDoctors();
      if (mounted) setDoctors(data);
      setLoading(false);
    }
    fetch();
    return () => (mounted = false);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Bác sĩ</h1>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {doctors.map((d) => (
            <div
              key={d.doctor_id}
              className="bg-white rounded-xl border shadow p-6 hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold text-gray-800">{d.doctor_name}</h3>
              <p className="text-gray-500 mt-1">Email: <b>{d.email}</b></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
