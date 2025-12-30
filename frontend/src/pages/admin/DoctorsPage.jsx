// src/pages/admin/DoctorsPage.jsx
import { useEffect, useState } from "react";
import { getDoctors } from "@/api/mockApi";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    getDoctors().then(setDoctors);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Bác sĩ</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {doctors.map((d) => (
          <div
            key={d.id}
            className="bg-white rounded-xl border shadow p-6 hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold text-gray-800">{d.name}</h3>
            <p className="text-gray-500 mt-1">
              Chuyên khoa: <b>{d.specialty}</b>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
