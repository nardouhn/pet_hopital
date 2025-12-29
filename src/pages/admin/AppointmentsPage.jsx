// src/pages/admin/AppointmentsPage.jsx
const appointments = [
  {
    id: 1,
    pet: "Milo",
    doctor: "BS. Minh",
    date: "20/12/2025",
    status: "Đã xác nhận",
  },
  {
    id: 2,
    pet: "Luna",
    doctor: "BS. Lan",
    date: "22/12/2025",
    status: "Chờ duyệt",
  },
];

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Lịch hẹn</h1>

      <div className="grid gap-4">
        {appointments.map((a) => (
          <div
            key={a.id}
            className="bg-white rounded-xl border shadow p-6 flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold text-gray-800">
                {a.pet} – {a.doctor}
              </h3>
              <p className="text-gray-500">{a.date}</p>
            </div>

            <span
              className={`px-4 py-1 rounded-full text-sm ${
                a.status === "Đã xác nhận"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {a.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
