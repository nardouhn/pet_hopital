import { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  Info,
} from "lucide-react";
import { getAdminAppointments } from "@/api/mockApi";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const defaultDate = new Date().toISOString().slice(0,10);
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedService, setSelectedService] = useState("all");
  const [appointmentDate, setAppointmentDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAdminAppointments();
        setAppointments(data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Normalize various backend date formats to YYYY-MM-DD
  const toIsoDate = (raw) => {
    if (!raw) return null;
    try {
      if (typeof raw === 'string') {
        const m = raw.match(/^\s*(\d{4}-\d{2}-\d{2})/);
        if (m) return m[1];
      }
      const dt = new Date(raw);
      if (isNaN(dt.getTime())) return null;
      return dt.toISOString().slice(0,10);
    } catch (e) {
      return null;
    }
  };

  // Calculate stats (based on selectedDate)
  const todayIso = selectedDate || new Date().toISOString().slice(0,10);
  const todayAppointments = appointments.filter((a) => {
    const iso = toIsoDate(a.date || a.booking_date || a.bookingDate);
    return iso === todayIso;
  });
  const confirmedCount = appointments.filter(
    (a) => a.status === "Đã nhận" || a.status === "Approved" || a.status === "Đặt lịch hẹn thành công"
  ).length;
  const pendingCount = appointments.filter(
    (a) =>
      a.status === "Pending" ||
      a.status === "Waiting" ||
      a.status === "Đã xử lí"
  ).length;
  const canceledCount = appointments.filter(
    (a) => a.status === "Canceled"
  ).length;

  // Filter appointments
    const filteredAppointments = appointments.filter((appointment) => {
    const apptIso = toIsoDate(appointment.date || appointment.booking_date || appointment.bookingDate);
    const matchesDate = !selectedDate || selectedDate === "all" || (apptIso && apptIso === selectedDate);
    const matchesStatus =
      selectedStatus === "all" || appointment.status === selectedStatus;
    const matchesService =
      selectedService === "all" || appointment.service === selectedService;

    return matchesDate && matchesStatus && matchesService;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Đã nhận":
        return "bg-green-100 text-green-700";
      case "Đã xử lí":
        return "bg-yellow-100 text-yellow-700";
      case "Urgent":
        return "bg-red-100 text-red-700";
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Waiting":
        return "bg-yellow-100 text-yellow-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Canceled":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-[#f8fafb] min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lịch hẹn</h1>
        <p className="text-sm text-gray-600 mt-1">
          Quản lý các lịch hẹn tốt hơn
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Calendar className="size-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">Lịch hẹn hôm nay</p>
          <p className="text-3xl font-bold text-gray-900">
            {todayAppointments.length}
          </p>
        </div>

        {/* Confirmed */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <CheckCircle className="size-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">Đã duyệt</p>
          <p className="text-3xl font-bold text-gray-900">{confirmedCount}</p>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-orange-50 rounded-xl">
              <Clock className="size-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">Chờ duyệt</p>
          <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
        </div>

        {/* Canceled */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-red-50 rounded-xl">
              <XCircle className="size-6 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">Đã hủy</p>
          <p className="text-3xl font-bold text-gray-900">{canceledCount}</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="size-5 text-gray-600" />
          <h3 className="text-base font-semibold text-gray-900">
            Filter Appointments
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Booking Date */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Booking date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-transparent"
            />
          </div>

          {/* All Statuses */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Pet type</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="Đã nhận">Đã nhận</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Waiting">Waiting</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>

          {/* All Services */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Service</label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-transparent"
            >
              <option value="all">All Services</option>
              <option value="Khám tổng quát">Khám tổng quát</option>
              <option value="Check-up">Check-up</option>
              <option value="Grooming">Grooming</option>
              <option value="Follow-up">Follow-up</option>
            </select>
          </div>

          {/* Appointment Date */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Appointment date
            </label>
            <input
              type="text"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Today's Appointments List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Today's Appointments
          </h2>
          <span className="text-sm text-teal-600">
            {filteredAppointments.length} Total
          </span>
        </div>

        {/* Appointments List */}
        <div className="divide-y divide-gray-100">
          {filteredAppointments.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-gray-500">No appointments found</p>
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-6">
                  {/* Time Badge */}
                  <div className="flex-shrink-0 bg-teal-500 text-white rounded-xl p-4 text-center min-w-[80px]">
                    <div className="text-xs opacity-90 mb-1">11:00 AM</div>
                    <div className="text-base font-bold">
                      {appointment.time}
                    </div>
                  </div>

                  {/* Pet & Owner Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="size-10 rounded-full bg-gradient-to-br from-teal-300 to-emerald-300 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-semibold">
                          {appointment.petName.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 mb-0.5">
                          {appointment.petName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {appointment.ownerName}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Service */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Service</p>
                    <p className="text-sm font-medium text-gray-900">
                      {appointment.service}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0 min-w-[100px]">
                    <p className="text-xs text-gray-500 mb-2">Status</p>
                    <span
                      className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {appointment.status}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex-shrink-0 min-w-[130px]">
                    <p className="text-xs text-gray-500 mb-2">
                      Appointment date
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="size-4 text-gray-400" />
                      <span>{appointment.date}</span>
                    </div>
                  </div>

                  {/* Details Button */}
                  <button className="flex items-center gap-1.5 px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors flex-shrink-0">
                    <Info className="size-4" />
                    <span className="text-sm font-medium">Details</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}