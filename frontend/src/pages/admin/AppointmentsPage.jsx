import { useEffect, useState } from "react";
import { getAdminAppointments } from "@/api/mockApi";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const data = await getAdminAppointments();
      setAppointments(data);
      setLoading(false);
    }
    fetch();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Lịch hẹn</h1>

      <div className="grid gap-4">
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          appointments.map((a) => (
            <div
              key={a.appointment_id}
              className="bg-white rounded-xl border shadow p-6 flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold text-gray-800">
                  {a.pet ? (a.pet.name || '-') : (a.pet_name || '-') } – {a.doctor ? (a.doctor.doctor_name || '-') : (a.doctor_name || '-')}
                </h3>
                <p className="text-gray-500">{a.booking_date} {a.timeslot ? `• ${a.timeslot}` : ""}</p>
                <p className="text-sm text-gray-600">Người đặt: {a.user ? `${a.user.first_name} ${a.user.last_name}` : '-'}</p>
              </div>

              <span
                className={`px-4 py-1 rounded-full text-sm ${
                  a.status === "Đặt lịch hẹn thành công" || a.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {a.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
