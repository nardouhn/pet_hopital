import { useState, useEffect } from "react";
import { Users, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { api } from "@/api/mockApi";

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [quickStats, setQuickStats] = useState(null);

  useEffect(() => {
    // Fetch data from mock API
    Promise.all([
      api.getStats(),
      api.getTodayAppointments(),
      api.getQuickStats(),
    ]).then(([statsData, appointmentsData, quickStatsData]) => {
      setStats(statsData);
      setAppointments(appointmentsData);
      setQuickStats(quickStatsData);
    });
  }, []);

  if (!stats || !quickStats) {
    return <div className="p-6">Loading...</div>;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Đang khám":
        return "bg-blue-100 text-blue-700";
      case "Đang chờ":
        return "bg-yellow-100 text-yellow-700";
      case "Đã lên lịch":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
          <p className="text-sm text-gray-500 mt-1">Tổng quan phòng khám...</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            Today: Thứ 3 ngày 18 tháng 12 năm 2025
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Số bệnh nhân tổng</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalPatients.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {stats.patientsGrowth}
              </p>
            </div>
            <div className="size-12 rounded-full bg-teal-100 flex items-center justify-center">
              <Users className="size-6 text-teal-500" />
            </div>
          </div>
        </div>

        {/* Total Appointments */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Số người hẹn già mời</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalAppointments.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {stats.appointmentsGrowth}
              </p>
            </div>
            <div className="size-12 rounded-full bg-pink-100 flex items-center justify-center">
              <Calendar className="size-6 text-pink-500" />
            </div>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Lịch hẹn hôm nay</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.todayAppointments}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {stats.appointmentsSchedule}
              </p>
            </div>
            <div className="size-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Calendar className="size-6 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tổng doanh thu</p>
              <p className="text-3xl font-bold text-gray-900">
                ${stats.monthlyRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {stats.revenueGrowth}
              </p>
            </div>
            <div className="size-12 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="size-6 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Lịch hẹn gần đây!</h2>
            <button className="text-sm text-teal-500 hover:text-teal-600">
              View All
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="size-12 rounded-full bg-gradient-to-br from-teal-200 to-teal-300 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {appointment.petName.charAt(0)}
                      </span>
                    </div>
                    {/* Info */}
                    <div>
                      <p className="font-semibold text-gray-900">
                        {appointment.petName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {appointment.ownerName}
                      </p>
                    </div>
                  </div>
                  {/* Time and Status */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {appointment.type}
                      </p>
                      <p className="text-xs text-gray-400">
                        {appointment.time}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats Sidebar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Thống kê nhanh</h2>
          </div>
          <div className="p-5 space-y-4">
            {/* New Patients */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-teal-100 flex items-center justify-center">
                  <Users className="size-5 text-teal-500" />
                </div>
                <span className="text-sm text-gray-600">Bệnh nhân mới</span>
              </div>
              <span className="font-bold text-gray-900">
                +{quickStats.newPatientsToday}
              </span>
            </div>

            {/* Avg Exam Time */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-pink-100 flex items-center justify-center">
                  <Calendar className="size-5 text-pink-500" />
                </div>
                <span className="text-sm text-gray-600">
                  Thời gian chờ trung bình
                </span>
              </div>
              <span className="font-bold text-gray-900">
                {quickStats.avgExamTime}
              </span>
            </div>

            {/* Pet Hotel Widget */}
            <div className="bg-gradient-to-br from-teal-300 to-emerald-300 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm opacity-90">Pet Hotel</p>
                  <p className="text-4xl font-bold mt-1">
                    {quickStats.petHotelGuests}
                  </p>
                </div>
                <TrendingUp className="size-8 opacity-80" />
              </div>
              <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-white h-full rounded-full transition-all"
                  style={{
                    width: `${(quickStats.petHotelGuests / 30) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs mt-2 opacity-90">
                of {quickStats.totalPets} total pets
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
