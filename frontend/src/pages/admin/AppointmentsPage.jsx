import { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  Plus,
  X,
  Info,
} from "lucide-react";
import { createPortal } from 'react-dom';
import { getAdminAppointments } from "@/api/mockApi";

export default function AppointmentsPage() {
//   const [appointments, setAppointments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const defaultDate = new Date().toISOString().slice(0,10);
//   const [selectedDate, setSelectedDate] = useState(defaultDate);
//   const [selectedStatus, setSelectedStatus] = useState("all");
//   const [selectedService, setSelectedService] = useState("all");
//   const [appointmentDate, setAppointmentDate] = useState("");
//   const [searchUser, setSearchUser] = useState("");


//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const data = await getAdminAppointments();
//         setAppointments(data);
//       } catch (error) {
//         console.error('Error fetching appointments:', error);
//         setAppointments([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   // Normalize various backend date formats to YYYY-MM-DD
//   const toIsoDate = (raw) => {
//     if (!raw) return null;
//     try {
//       if (typeof raw === 'string') {
//         const m = raw.match(/^\s*(\d{4}-\d{2}-\d{2})/);
//         if (m) return m[1];
//       }
//       const dt = new Date(raw);
//       if (isNaN(dt.getTime())) return null;
//       return dt.toISOString().slice(0,10);
//     } catch (e) {
//       return null;
//     }
//   };

//   // Calculate stats (based on selectedDate)
//   const todayIso = selectedDate || new Date().toISOString().slice(0,10);
//   const todayAppointments = appointments.filter((a) => {
//     const iso = toIsoDate(a.date || a.booking_date || a.bookingDate);
//     return iso === todayIso;
//   });
//   const confirmedCount = appointments.filter(
//     (a) => a.status === "Đã nhận" || a.status === "Approved" || a.status === "Đặt lịch hẹn thành công"
//   ).length;
//   const pendingCount = appointments.filter(
//     (a) =>
//       a.status === "Pending" ||
//       a.status === "Waiting" ||
//       a.status === "Đang chờ xác nhận"
//   ).length;
//   const canceledCount = appointments.filter(
//     (a) => a.status === "Canceled" || a.status === "Đã huỷ lịch hẹn"
//   ).length;

//   // Filter appointments
//     const filteredAppointments = appointments.filter((appointment) => {
//   const apptIso = toIsoDate(
//     appointment.date ||
//     appointment.booking_date ||
//     appointment.bookingDate
//   );

//   const matchesDate =
//     !selectedDate || apptIso === selectedDate;

//   const matchesStatus =
//     selectedStatus === "all" ||
//     appointment.status === selectedStatus;

//   const matchesUser =
//     !searchUser ||
//     appointment.ownerName
//       .toLowerCase()
//       .includes(searchUser.toLowerCase());

//   return matchesDate && matchesStatus && matchesUser;
// });


//   const getStatusColor = (status) => {
//     switch (status) {
//       case "Đã nhận":
//         return "bg-green-100 text-green-700";
//       case "Đã xử lí":
//         return "bg-yellow-100 text-yellow-700";
//       case "Urgent":
//         return "bg-red-100 text-red-700";
//       case "Approved":
//         return "bg-green-100 text-green-700";
//       case "Waiting":
//         return "bg-yellow-100 text-yellow-700";
//       case "Pending":
//         return "bg-yellow-100 text-yellow-700";
//       case "Canceled":
//         return "bg-gray-200 text-gray-700";
//       default:
//         return "bg-gray-100 text-gray-600";
//     }
//   };

//   if (loading) {
//     return <div className="p-6">Loading...</div>;
//   }
const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchUser, setSearchUser] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  // update status
  const [updatingId, setUpdatingId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
   const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);


  // add slot
  const [checkIn, setCheckIn] = useState("");
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAdminAppointments();
        setAppointments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toIsoDate = (raw) => {
    if (!raw) return null;
    const dt = new Date(raw);
    if (isNaN(dt.getTime())) return null;
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const d = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Calculate stats (based on selectedDate)
  const todayIso = selectedDate || new Date().toISOString().slice(0,10);
  const todayAppointments = appointments.filter((a) => {
    const iso = toIsoDate(a.date || a.booking_date || a.bookingDate);
    return iso === todayIso;
  });
  // Partition today's appointments into three categories so their sum equals total
  const confirmedSet = new Set(["Đã nhận", "Approved", "Đặt lịch hẹn thành công"]);
  const pendingSet = new Set(["Pending", "Waiting", "Đang chờ xác nhận"]);
  const canceledSet = new Set(["Canceled", "Đã huỷ lịch hẹn", "đã huỷ lịch hẹn", "Đã hủy lịch hẹn"]);

  let confirmedCount = 0;
  let pendingCount = 0;
  let canceledCount = 0;

  todayAppointments.forEach((a) => {
    const s = (a.status || "").trim();
    if (confirmedSet.has(s)) confirmedCount += 1;
    else if (canceledSet.has(s)) canceledCount += 1;
    else if (pendingSet.has(s)) pendingCount += 1;
    else canceledCount += 1; // unknown statuses count as pending to keep totals consistent
  });

  // Filter appointments
  const filteredAppointments = appointments.filter((appointment) => {
    const apptIso = toIsoDate(
      appointment.date ||
      appointment.booking_date ||
      appointment.bookingDate
    );

    const matchesDate =
      !selectedDate || apptIso === selectedDate;

    const matchesStatus =
      selectedStatus === "all" || appointment.status === selectedStatus;

    const matchesUser =
      !searchUser ||
      appointment.ownerName.toLowerCase().includes(searchUser.toLowerCase());

    return matchesDate && matchesStatus && matchesUser;
  });

  const handleUpdateStatus = (id) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: newStatus } : a
      )
    );
    setUpdatingId(null);
    setNewStatus("");
  };

  const updateStatus = (id, status) => {
  setAppointments((prev) =>
    prev.map((a) =>
      a.id === id ? { ...a, status } : a
    )
  );
};


  const handleAddSlot = () => {
    if (!checkIn) return;
    setSlots((prev) => [
      ...prev,
      { id: Date.now(), check_in: checkIn },
    ]);
    setCheckIn("");
  };

  const getStatusColor = (status) => {
  switch (status) {
    case "Đặt lịch hẹn thành công":
      return "bg-green-100 text-green-700";
    case "Đang chờ xác nhận":
      return "bg-yellow-100 text-yellow-700";
    case "Đã hủy lịch hẹn":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};


  

  if (loading) return <div className="p-6">Loading...</div>;

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
          <p className="text-sm text-gray-600 mb-2">Tổng số lịch hẹn</p>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Booking Date */}
          {/* <div>
            <label className="block text-sm text-gray-600 mb-2">
              Booking date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-transparent"
            />
          </div> */}

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Appointment date
            </label>
            <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="input w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                    />
          </div>

          {/* All Statuses */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="Đang chờ xác nhận">Đang chờ xác nhận</option>
              <option value="Đặt lịch hẹn thành công">Đặt lịch hẹn thành công</option>
              <option value="Đã hủy lịch hẹn">Đã hủy lịch hẹn</option>
              
            </select>
          </div>

          
          <div>
  <label className="block text-sm text-gray-600 mb-2">
    User name
  </label>
  <input
    type="text"
    value={searchUser}
    onChange={(e) => setSearchUser(e.target.value)}
    placeholder="Search by owner name"
    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
  />
</div>

          
          

        </div>
          {/* Appointment Date */}
          {/* <div>
            <label className="block text-sm text-gray-600 mb-2">
              Appointment date
            </label>
            <input
              type="text"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-transparent"
            />
          </div> */}
        
      </div>

      {/* Today's Appointments List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          
          <span className="text-sm text-teal-600 ml-auto">
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
                    <div className="text-xs opacity-90 mb-1">{toIsoDate(appointment.date) || "—"}</div>
                    <div className="text-base font-bold">{appointment.time}</div>
                  </div>

                  {/* Pet & Owner Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      
                      <div className="min-w-0">
                        
                        <p className="text-sm text-gray-500">
                          {appointment.ownerName}
                        </p>
                      </div>
                    </div>
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
                      <span>{toIsoDate(appointment.date)}</span>
                    </div>
                  </div>


                  {/* Add Checkout Column */}
                  <div className="flex-shrink-0">
                    <p className="text-xs text-gray-500 mb-2">Thêm lịch khám</p>
                    <button 
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowCheckinModal(true);
                      }}
                      className="p-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                    >
                      <Plus className="size-5" />
                    </button>
                  </div>

                  {/*  Button */}
                  <button
                    onClick={() =>
                      updateStatus(appointment.id, "Đặt lịch hẹn thành công")
                    }
                    className="flex items-center gap-1.5 px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <span className="text-sm font-medium">Xác nhận</span>
                  </button>

                  
                  <button
                    onClick={() =>
                      updateStatus(appointment.id, "Đã hủy lịch hẹn")
                    }
                    className="flex items-center gap-1.5 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <span className="text-sm font-medium">Hủy lịch hẹn</span>
                  </button>


                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Checkout Date Modal */}
      {showCheckinModal && (
        <CheckinModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowCheckinModal(false);
            setSelectedAppointment(null);
          }}
        />
      )}
    </div>
  );
}

function CheckinModal({ appointment, onClose }) {
  const [checkoutDate, setCheckoutDate] = useState('');

  useEffect(() => {
    // disable scroll
    document.body.style.overflow = "hidden";

    return () => {
      // enable scroll back
      document.body.style.overflow = "auto";
    };
  }, []);


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!checkoutDate) {
      alert('Vui lòng chọn ngày tái khám');
      return;
    }
    // Here you would call API to save the checkout date
    console.log('Checkout date for', appointment?.petName, ':', checkoutDate);
    alert(`Đã thêm lịch tái khám cho ${appointment?.petName} vào ngày ${checkoutDate}`);
    onClose();
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/40 bg-opacity-30 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 w-[450px] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="size-5 text-gray-600" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-teal-100 rounded-xl">
              <Calendar className="size-6 text-teal-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Thêm lượt khám</h2>
          </div>
          {appointment && (
            <p className="text-sm text-gray-600 ml-[60px]">
              
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Checkin *
            </label>
            <input
              type="datetime-local"
            
              value={checkoutDate}
              onChange={(e) => setCheckoutDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Plus className="size-5" />
              Thêm lịch
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

