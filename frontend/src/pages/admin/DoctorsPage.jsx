import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Calendar,
  Plus,
  UserCircle2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
  UserPlus
} from "lucide-react";
import { getAdminDoctors, getDoctorsSchedule, addDoctor, deleteDoctor } from "@/api/mockApi";

// Shared shift legend and helpers (module-level) so list & schedule use identical mapping/colors
const SHIFTS = [
  { id: 1, label: "Shift 1: Morning Shift", color: "bg-teal-200" },
  { id: 2, label: "Shift 2: Afternoon Shift", color: "bg-gray-300" },
  { id: 3, label: "Shift 3: Evening Shift", color: "bg-gray-400" },
  { id: 4, label: "Shift 4: Night Shift", color: "bg-yellow-200" },
  { id: 5, label: "Shift 5: Weekend Shift", color: "bg-green-200" },
  { id: 6, label: "Shift 6: Emergency Shift", color: "bg-blue-200" },
];

const getShiftColor = (shiftId) => {
  const s = SHIFTS.find((x) => String(x.id) === String(shiftId));
  return s ? s.color : "bg-gray-100";
};

const getShiftLabel = (shiftId) => {
  const s = SHIFTS.find((x) => String(x.id) === String(shiftId));
  return s ? s.label : String(shiftId);
};

// Map backend shift string (e.g. '9-12') or numeric to legend id
const mapShiftValueToLegend = (val) => {
  if (!val && val !== 0) return null;
  const v = String(val).trim();
  if (!v) return null;
  if (v.toUpperCase() === 'NONE') return null;
  const l = v.toLowerCase();
  if (['9-12', '9-13'].includes(l)) return 1;
  if (['12-18', '13-18'].includes(l)) return 2;
  if (['9-17', '10-18'].includes(l)) return 3;
  const asNum = Number(v);
  if (Number.isFinite(asNum) && asNum >= 1 && asNum <= 6) return asNum;
  return null;
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'schedule'
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 11, 1)); // December 2025
  const [showAddModal, setShowAddModal] = useState(false);

  // Add doctor function
  const handleAddDoctor = async (doctorData) => {
    try {
      const newDoctor = await addDoctor(doctorData);
      setDoctors([...doctors, newDoctor]);
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding doctor:", error);
      alert("Failed to add doctor. Please try again.");
    }
  };

  // Delete doctor function
  const handleDelete = async (doctorId) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      try {
        await deleteDoctor(doctorId);
        // Refresh the doctors list
        const updatedDoctors = doctors.filter(
          (doctor) => doctor.id !== doctorId
        );
        setDoctors(updatedDoctors);
      } catch (error) {
        console.error("Error deleting doctor:", error);
        alert("Failed to delete doctor. Please try again.");
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [data, scheduleRows] = await Promise.all([getAdminDoctors(), getDoctorsSchedule()]);

        // build monthlySchedule map per doctor: { doctorName: { dayNumber: shift } }
        const scheduleMap = {};
        (scheduleRows || []).forEach((r) => {
          const name = r.doctor_name || r.doctorName || r.doctor || '';
          let dayNum = null;
          try {
            dayNum = new Date(r.slot_date).getDate();
          } catch (e) {
            dayNum = null;
          }
          if (!name) return;
          if (!scheduleMap[name]) scheduleMap[name] = {};
          if (dayNum) scheduleMap[name][dayNum] = r.shift;
        });

        // merge scheduleMap into doctors as monthlySchedule
        const merged = (data || []).map(d => ({
          ...d,
          monthlySchedule: scheduleMap[d.name] || d.monthlySchedule || {}
        }));
        setDoctors(merged);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  // Navigate between months
  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const getMonthName = () => {
    return currentMonth.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // Shift legend and colors are defined at module scope: `SHIFTS`, `getShiftColor`, `getShiftLabel`

  // List view: render weekday names (Monday, Tuesday, ...) for the doctor's schedule
  // No colors or shift details here per UI requirement.
  const renderScheduleWeekdays = (doctor) => {
    const ms = doctor.monthlySchedule || {};
    // Only consider days where the shift maps to a legend (skip 'NONE' and unknown values)
    const dayNums = Object.entries(ms)
      .filter(([k, v]) => mapShiftValueToLegend(v) !== null)
      .map(([k]) => Number(k))
      .filter((n) => Number.isFinite(n));

    // Fallback: if monthlySchedule empty, try doctor.schedule entries with slot_date and valid shift
    if (dayNums.length === 0 && Array.isArray(doctor.schedule)) {
      const fallbackDays = doctor.schedule
        .map((s) => {
          if (!s) return null;
          // determine shift value and date fields if present
          const shiftVal = s.shift ?? s.shift_time ?? s.shiftTime ?? s;
          if (mapShiftValueToLegend(shiftVal) === null) return null;
          const dateStr = s.slot_date ?? s.slotDate ?? s.date ?? null;
          if (!dateStr) return null;
          const dt = new Date(dateStr);
          return Number.isFinite(dt.getDate()) ? dt.getDate() : null;
        })
        .filter((n) => Number.isFinite(n));

      if (fallbackDays.length) {
        const uniqFd = Array.from(new Set(fallbackDays));
        const weekdays = uniqFd.map((d) => {
          const dt = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d);
          return dt.toLocaleDateString('en-US', { weekday: 'long' });
        });
        return (
          <div className="flex gap-2 flex-wrap">
            {weekdays.map((w) => (
              <span key={w} className="text-sm text-gray-700">{w}</span>
            ))}
          </div>
        );
      }
    }

    if (dayNums.length === 0) {
      return <span className="text-sm text-gray-500">-</span>;
    }

    const uniq = Array.from(new Set(dayNums));
    const weekdays = uniq.map((d) => {
      const dt = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d);
      return dt.toLocaleDateString('en-US', { weekday: 'long' });
    });

    return (
      <div className="flex gap-2 flex-wrap">
        {weekdays.map((w) => (
          <span key={w} className="text-sm text-gray-700">{w}</span>
        ))}
      </div>
    );
  };

  // Schedule View
  if (viewMode === "schedule") {
    return (
      <ScheduleView
        doctors={doctors}
        onBack={() => setViewMode("list")}
        currentMonth={currentMonth}
        onPreviousMonth={previousMonth}
        onNextMonth={nextMonth}
        monthName={getMonthName()}
      />
    );
  }

  // List View
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Doctors Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách bác sĩ</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setViewMode("schedule")}
            className="flex items-center gap-2 px-4 py-2.5 border border-teal-500 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
          >
            <Calendar className="size-4" />
            View Schedule
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            <Plus className="size-4" />
            Add Doctor
          </button>
        </div>
      </div>

      {/* Content */}
      {doctors.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="size-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <UserCircle2 className="size-12 text-gray-400" />
            </div>
            <p className="text-gray-600">
              No doctors found. Add your first doctor to get started.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Doctor
                  </th>
                  
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {doctors.map((doctor) => (
                  <tr
                    key={doctor.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-gradient-to-br from-teal-300 to-emerald-300 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {doctor.name.split(" ").pop().charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {doctor.name}
                          </p>
                          
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-500">
                            {doctor.email}
                          </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">
                        {doctor?.current_status && String(doctor.current_status).trim() !== "" ? doctor.current_status : "Unknown"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                        onClick={() => handleDelete(doctor.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddDoctorModal
          onClose={() => setShowAddModal(false)}
          onAddDoctor={handleAddDoctor}
        />
      )}
    </div>
  );
}

function AddDoctorModal({ onClose, onAddDoctor }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }
    onAddDoctor({
      name,
      email,
      schedule: [],
    });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-[#d7fffb] rounded-[30px] shadow-[0px_30px_20px_15px_rgba(140,185,176,0.32)]
        border border-[rgba(107,114,128,0.3)] p-8 w-[540px] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="absolute left-[103px] top-[37px] size-[30px]">
          <UserPlus className="size-full text-teal-600" />
        </div>

        <h2 className="text-center text-[24px] font-semibold italic text-[#1d3b5e] mb-8">
          Thêm bác sĩ
        </h2>

        <div className="bg-white border-2 border-[#ccfbf1] rounded-[17px] shadow-lg p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-bold text-sm mb-2 block">Họ Tên</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="font-bold text-sm mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="font-bold text-sm mb-2 block">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-teal-500 text-white py-3 rounded-lg font-bold"
            >
              Thêm
            </button>
          </form>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-black/10 rounded-full"
        >
          <X />
        </button>
      </div>
    </div>,
    document.body
  );
}


function ScheduleView({
  doctors,
  onBack,
  currentMonth,
  onPreviousMonth,
  onNextMonth,
  monthName,
}) {
  // Days to show in calendar (2-17)
  const days = Array.from({ length: 7 }, (_, i) => i + 2);

  // Use shared `SHIFTS`, `getShiftColor`, `getShiftLabel` from module scope

  return (
    <div className="p-6 space-y-6 bg-[#f8fafb] min-h-screen">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="size-4" />
        <span className="text-sm">Quay lại danh sách bác sĩ</span>
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch công việc</h1>
          <p className="text-sm text-gray-500 mt-1">
            Lịch tổng quát theo tháng
          </p>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
          <button
            onClick={onPreviousMonth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronLeft className="size-5 text-gray-600" />
          </button>
          <span className="font-semibold text-gray-900 min-w-[140px] text-center">
            {monthName}
          </span>
          <button
            onClick={onNextMonth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronRight className="size-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Shift Legend */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Shift Legend
        </h3>
        <div className="flex flex-wrap gap-4">
          {SHIFTS.map((shift) => (
            <div key={shift.id} className="flex items-center gap-2">
              <div className={`size-4 rounded ${shift.color}`}></div>
              <span className="text-sm text-gray-600">{shift.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky left-0 bg-gray-50 min-w-[180px]">
                  Doctor
                </th>
                {days.map((day) => (
                  <th
                    key={day}
                    className="px-3 py-3 text-center text-sm font-semibold text-gray-700 min-w-[60px]"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {doctors.length === 0 ? (
                <tr>
                  <td
                    colSpan={days.length + 1}
                    className="px-6 py-16 text-center"
                  >
                    <p className="text-gray-500">
                      No doctors available to schedule.
                    </p>
                  </td>
                </tr>
              ) : (
                doctors.map((doctor) => (
                  <tr
                    key={doctor.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 sticky left-0 bg-white border-r border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-gradient-to-br from-teal-300 to-emerald-300 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-semibold">
                            {doctor.name.split(" ").pop().charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {doctor.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {doctor.specialty}
                          </p>
                        </div>
                      </div>
                    </td>
                    {days.map((day) => {
                      const rawShift = doctor.monthlySchedule?.[day];
                      const legendId = mapShiftValueToLegend(rawShift);
                      return (
                        <td key={day} className="px-3 py-3">
                          <div className="flex justify-center">
                            {legendId ? (
                              <div
                                className={`${getShiftColor(
                                  legendId
                                )} size-8 rounded flex items-center justify-center`}
                                title={getShiftLabel(legendId)}
                              >
                                <span className="text-xs font-semibold text-gray-700">
                                  {getShiftLabel(legendId).split(':')[0].replace('Shift ', '')}
                                </span>
                              </div>
                            ) : (
                              <div className="size-8"></div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}