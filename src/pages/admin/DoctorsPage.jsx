import { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  UserCircle2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { api } from "@/api/mockApi";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'schedule'
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 11, 1)); // December 2025

  useEffect(() => {
    api.getDoctors().then((data) => {
      setDoctors(data);
      setLoading(false);
    });
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
          <button className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
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
                    Specialty
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Schedule
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
                          <p className="text-sm text-gray-500">
                            {doctor.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {doctor.specialty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {doctor.phone}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {doctor.schedule.map((day, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded"
                          >
                            {day}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="text-sm text-teal-600 hover:text-teal-700">
                          Edit
                        </button>
                        <button className="text-sm text-red-600 hover:text-red-700">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
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
  const days = Array.from({ length: 16 }, (_, i) => i + 2);

  const shifts = [
    { id: 1, label: "Shift 1: Morning Shift", color: "bg-teal-200" },
    { id: 2, label: "Shift 2: Afternoon Shift", color: "bg-gray-300" },
    { id: 3, label: "Shift 3: Evening Shift", color: "bg-gray-400" },
    { id: 4, label: "Shift 4: Night Shift", color: "bg-yellow-200" },
    { id: 5, label: "Shift 5: Weekend Shift", color: "bg-green-200" },
    { id: 6, label: "Shift 6: Emergency Shift", color: "bg-blue-200" },
  ];

  const getShiftColor = (shiftId) => {
    const shift = shifts.find((s) => s.id === shiftId);
    return shift ? shift.color : "bg-gray-100";
  };

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
          {shifts.map((shift) => (
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
                      const shiftId = doctor.monthlySchedule?.[day];
                      return (
                        <td key={day} className="px-3 py-3">
                          <div className="flex justify-center">
                            {shiftId ? (
                              <div
                                className={`${getShiftColor(
                                  shiftId
                                )} size-8 rounded flex items-center justify-center`}
                                title={
                                  shifts.find((s) => s.id === shiftId)?.label
                                }
                              >
                                <span className="text-xs font-semibold text-gray-700">
                                  {shiftId}
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
