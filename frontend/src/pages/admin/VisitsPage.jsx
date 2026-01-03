import { useState, useEffect } from "react";
import {
  Clock,
  Stethoscope,
  CheckCircle,
  FileText,
  Plus,
  RotateCcw,
  ExternalLink,
  Trash2,
  X,
} from "lucide-react";
import { createPortal } from "react-dom";
import { getAdminAppointments, getAppointmentsStats, updateSlotCheckout, updateSlotStatus, getUserPets, createPatientReport } from "@/api/mockApi";

export default function VisitsPage() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const defaultDate = new Date().toISOString().slice(0,10);
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedService, setSelectedService] = useState("all");
  const [selectedDoctor, setSelectedDoctor] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVisitForModal, setSelectedVisitForModal] = useState(null);
   const [editingCheckout, setEditingCheckout] = useState(null);
  const [checkoutValue, setCheckoutValue] = useState('');


  const [status, setStatus] = useState("");

  const formatVN = (iso) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso;
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
    } catch (e) {
      return iso;
    }
  }
  // normalize various backend date formats to YYYY-MM-DD
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

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    const fetchData = async () => {
      try {
        const [visitsData, statsData] = await Promise.all([
          getAdminAppointments(),
          getAppointmentsStats()
        ]);
        if (!mounted) return;
        setVisits(visitsData || []);
        // Use statsData if needed
      } catch (err) {
        console.error('Error fetching visits:', err);
        if (!mounted) return;
        setVisits([]);
        setError(err?.message || 'Lỗi khi tải lượt khám');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  // Calculate stats for today
  const todayIso = selectedDate || new Date().toISOString().slice(0,10);
  const todayVisits = visits.filter((v) => {
    // Prefer slot check-in date (ISO) when available, otherwise fall back to booking_date
    const iso = toIsoDate(v.checkInIso || v.date || v.booking_date || v.bookingDate);
    return iso === todayIso;
  });
  const waitingCount = todayVisits.filter((v) => v.status === "Đang chờ").length;
  const inProgressCount = todayVisits.filter(
    (v) => v.status === "Đang khám"
  ).length;
  const completedCount = todayVisits.filter(
    (v) => v.status === "Đã xong"
  ).length;
  const totalTodayCount = todayVisits.length;

  // Apply filters
  const filteredVisits = visits.filter((visit) => {
    const visitIso = toIsoDate(visit.date || visit.booking_date || visit.bookingDate);
    const matchesDate = selectedDate === "all" || (visitIso && visitIso === selectedDate);
    const matchesStatus = selectedStatus === "all" || visit.status === selectedStatus;
    const matchesService = selectedService === "all" || visit.service === selectedService;
    const matchesDoctor = selectedDoctor === "all" || visit.doctor === selectedDoctor;
    const pet = (visit.petName || visit.pet_name || visit.pet || '').toString();
    const owner = (visit.ownerName || visit.owner_name || visit.owner || '').toString();
    const matchesSearch = searchTerm === "" || owner.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesDate && matchesStatus && matchesService && matchesDoctor && matchesSearch;
  });
  // const handleStatusChange = async (visitId, newStatus) => {
  //   try {
  //     // optimistic UI update
  //     setVisits((prev) => prev.map((v) => v.id === visitId ? { ...v, status: newStatus } : v));
  //     const slot = visits.find(v => v.id === visitId);
  //     const slotId = slot?.slotId || visitId;
  //     await updateSlotStatus(slotId, newStatus);
  //   } catch (err) {
  //     console.error('Failed to update status:', err);
  //     setError(err?.message || 'Failed to update status');
  //     // revert optimistic update: refetch visits
  //     try {
  //       const rows = await getAdminAppointments();
  //       setVisits(rows || []);
  //     } catch (e) { console.error(e); }
  //   }
  // };

  const handleStatusChange = async (visitId, newStatus) => {
    try {
      // optimistic UI update
      setVisits((prev) => prev.map((v) => (v.id === visitId ? { ...v, status: newStatus } : v)));

      const slot = visits.find((v) => v.id === visitId);
      const slotId = slot?.slotId || visitId;

      await updateSlotStatus(slotId, newStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
      setError(err?.message || 'Failed to update status');
      // revert optimistic update: refetch visits
      try {
        const rows = await getAdminAppointments();
        setVisits(rows || []);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleApplyFilter = () => {
    // Filters are applied in real-time, this is just for UI feedback
    console.log("Filters applied");
  };

  const handleReset = () => {
    setSelectedDate("");
    setSelectedStatus("all");
    setSelectedService("all");
    setSelectedDoctor("all");
    setSearchTerm("");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Hoàn thành":
        return "bg-green-100 text-green-700";
      case "Đang khám":
        return "bg-blue-100 text-blue-700";
      case "Chờ":
        return "bg-yellow-100 text-yellow-700";
      case "Hoàn trả":
        return "bg-teal-100 text-teal-700";
      case "Đã đăng ký":
        return "bg-blue-100 text-blue-700";
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
        <h1 className="text-3xl font-bold text-gray-900">Quản lý lượt khám</h1>
        <p className="text-sm text-gray-600 mt-1">
          Quản lý các lượt khám nhất theo thời gian thực và theo dõi nhà điện
          chẩn / check-out
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Waiting */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-yellow-50 rounded-xl">
              <Clock className="size-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">Đang chờ</p>
          <p className="text-3xl font-bold text-gray-900">{waitingCount}</p>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Stethoscope className="size-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">Đang khám</p>
          <p className="text-3xl font-bold text-gray-900">{inProgressCount}</p>
        </div>

        {/* Completed Today */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <CheckCircle className="size-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">Đã xong</p>
          <p className="text-3xl font-bold text-gray-900">{completedCount}</p>
        </div>

        {/* Total Today */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <FileText className="size-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">Tổng đơn</p>
          <p className="text-3xl font-bold text-gray-900">{totalTodayCount}</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Date */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-transparent"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-transparent"
            >
              <option value="all">All status</option>
              <option value="Đang chờ">Đang chờ</option>
              <option value="Đang khám">Đang khám</option>
              <option value="Đã xong">Đã xong</option>
            </select>
          </div>

          

          {/* Doctor */}
          {/* <div>
            <label className="block text-sm text-gray-600 mb-2">Doctor</label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-transparent"
            >
              <option value="all">All Doctors</option>
              <option value="Dr. Smith">Dr. Smith</option>
              <option value="Dr. Johnson">Dr. Johnson</option>
              <option value="Dr. Williams">Dr. Williams</option>
            </select>
          </div> */}

          {/* Search Pet/Owner */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Search Owner
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type name..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-3">
          {/* <button
            onClick={handleApplyFilter}
            className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors"
          >
            Apply Filter
          </button> */}
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="size-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Visits Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Lượt khám</h2>
            <p className="text-sm text-gray-500">{selectedDate}</p>
            {error && (
              <div className="mt-2 text-sm text-red-600">{error}</div>
            )}
          </div>
          
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SLOT ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CHECK-IN
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CHECK-OUT
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PET
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  OWNER
                </th>
                
                {/* <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DOCTOR
                </th> */}
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredVisits.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-6 py-16 text-center text-gray-500"
                  >
                    No visits found
                  </td>
                </tr>
              ) : (
                filteredVisits.map((visit) => (
                  <tr
                    key={visit.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Slot ID */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {visit.slotId || visit.appointment_id || visit.id}
                      </span>
                    </td>

                    {/* Check-in */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-teal-600 font-medium">
                        {visit.checkIn || (visit.checkInIso ? formatVN(visit.checkInIso) : (visit.date ? visit.date : 'Not set'))}
                      </span>
                    </td>

                    {/* Check-out */}
                    {/* Check-out */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCheckout === visit.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="datetime-local"
                            value={checkoutValue}
                            onChange={(e) => setCheckoutValue(e.target.value)}
                            className="w-[180px] bg-teal-50 border-2 border-teal-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                            autoFocus
                          />
                          <button
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            onClick={async () => {
                              if (!checkoutValue) return;
                              try {
                                const iso = new Date(checkoutValue).toISOString();
                                const slotId = visit.slotId || visit.id;
                                await updateSlotCheckout(slotId, { check_out: iso });

                                const formattedDateTime = (() => {
                                  const d = new Date(checkoutValue);
                                  const dd = String(d.getDate()).padStart(2, '0');
                                  const mm = String(d.getMonth() + 1).padStart(2, '0');
                                  const yyyy = d.getFullYear();
                                  const hh = String(d.getHours()).padStart(2, '0');
                                  const min = String(d.getMinutes()).padStart(2, '0');
                                  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
                                })();

                                const updatedVisits = visits.map(v =>
                                  v.id === visit.id ? { ...v, checkOut: formattedDateTime } : v
                                );
                                setVisits(updatedVisits);
                                setEditingCheckout(null);
                                setCheckoutValue('');
                              } catch (err) {
                                console.error('Failed to update checkout', err);
                                setError(err?.message || 'Failed to update check-out');
                              }
                            }}
                          >
                            <CheckCircle className="size-4" />
                          </button>
                          <button
                            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={() => {
                              setEditingCheckout(null);
                              setCheckoutValue('');
                            }}
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="flex items-center gap-2 w-full text-left"
                          onClick={() => {
                            setEditingCheckout(visit.id);
                            // If slot has existing ISO checkout, use it; otherwise default to now
                            if (visit.checkOutIso) {
                              const d = new Date(visit.checkOutIso);
                              const year = d.getFullYear();
                              const month = String(d.getMonth() + 1).padStart(2, '0');
                              const day = String(d.getDate()).padStart(2, '0');
                              const hours = String(d.getHours()).padStart(2, '0');
                              const minutes = String(d.getMinutes()).padStart(2, '0');
                              setCheckoutValue(`${year}-${month}-${day}T${hours}:${minutes}`);
                            } else if (!visit.checkOut || visit.checkOut === 'Not set') {
                              const now = new Date();
                              const year = now.getFullYear();
                              const month = String(now.getMonth() + 1).padStart(2, '0');
                              const day = String(now.getDate()).padStart(2, '0');
                              const hours = String(now.getHours()).padStart(2, '0');
                              const minutes = String(now.getMinutes()).padStart(2, '0');
                              setCheckoutValue(`${year}-${month}-${day}T${hours}:${minutes}`);
                            } else {
                              setCheckoutValue('');
                            }
                          }}
                        >
                          <span className={`text-sm ${visit.checkOut && visit.checkOut !== 'Not set' ? 'text-gray-900 font-medium' : 'text-gray-400 italic'}`}>
                            {visit.checkOut || (visit.checkOutIso ? formatVN(visit.checkOutIso) : 'Not set')}
                          </span>
                          <Clock className="size-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )}
                    </td>

                    {/* Pet */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-full bg-gradient-to-br from-teal-300 to-emerald-300 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-semibold">
                            {visit.petName.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {visit.petName}
                        </span>
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {visit.ownerName}
                      </span>
                    </td>

                    

                    {/* Doctor */}
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {visit.doctorame || visit.doctor || '-'}
                      </span>
                    </td> */}

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                        <label className="block text-sm text-gray-600 mb-2"></label>
                        <select
  value={visit.status}
  onChange={(e) => handleStatusChange(visit.id, e.target.value)}
  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm"
>
  <option value="" disabled>—</option>
  <option value="Đang chờ">Đang chờ</option>
  <option value="Đang khám">Đang khám</option>
  <option value="Đã xong">Đã xong</option>
</select>

                      </div>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
            onClick={() => { setSelectedVisitForModal(visit); setShowAddModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors"
          >
            <Plus className="size-4" />
            Thêm hồ sơ
          </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Add Visit Modal */}
      {showAddModal && selectedVisitForModal && (
        <AddVisitModal
          onClose={() => { setShowAddModal(false); setSelectedVisitForModal(null); }}
          slotId={selectedVisitForModal.slotId || selectedVisitForModal.id}
          userId={selectedVisitForModal.user_id}
          onCreated={async () => {
            // refresh visits after creating patient report
            try {
              setLoading(true);
              const [visitsData] = await Promise.all([getAdminAppointments()]);
              setVisits(visitsData || []);
            } catch (e) {
              console.error('Error refreshing visits:', e);
            } finally {
              setLoading(false);
            }
          }}
        />
      )}

    </div>
  );
}

function AddVisitModal({ onClose, slotId, userId, onCreated }) {
  const [petId, setPetId] = useState('');
  const [pets, setPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchPets() {
      setLoadingPets(true);
      try {
        const list = await getUserPets(userId);
        if (mounted) setPets(list || []);
      } catch (err) {
        console.error('Failed to fetch user pets', err);
        if (mounted) setPets([]);
      } finally {
        if (mounted) setLoadingPets(false);
      }
    }
    if (userId) fetchPets();
    return () => { mounted = false; };
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!petId) {
      alert('Vui lòng chọn thú cưng');
      return;
    }
    try {
      await createPatientReport(slotId, { pet_id: petId });
      alert('Đã thêm hồ sơ cho lượt khám');
      onClose();
      if (onCreated) onCreated();
    } catch (err) {
      console.error('Failed to create patient report', err);
      alert('Không thể tạo hồ sơ: ' + (err?.message || 'Lỗi'));
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#eff6ff] rounded-[30px] shadow-[0px_30px_20px_15px_rgba(140,185,176,0.32)] border border-[rgba(107,114,128,0.3)] w-full max-w-[536px] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="pt-8 pb-4 px-8">
          <div className="flex items-center justify-center gap-3 mb-1">
            <span className="text-[24px]">🐱</span>
            <h2 className="text-[24px] font-semibold italic text-[#1d3b5e] text-center">
              Thêm thông tin hồ sơ
            </h2>
          </div>
        </div>

        {/* Form Container */}
        <div className="px-8 pb-8">
          <div className="bg-white rounded-[17px] border-2 border-[#e0e1ff] shadow-[0px_17px_35px_-8px_rgba(0,0,0,0.25)] p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Pet Name Selection */}
              <div>
                <label className="flex items-center gap-2 text-[12px] font-bold text-[#1f2937] mb-2">
                  <span>🐕</span>
                  Tên thú cưng
                </label>
                <select
                  value={petId}
                  onChange={(e) => setPetId(e.target.value)}
                  className="w-full bg-[#ccfbf1] border border-[#e5e7eb] rounded-[13px] px-4 py-3 text-[12px] text-black focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent"
                  required
                >
                  <option value="">{loadingPets ? 'Đang tải...' : 'Chọn thú cưng...'}</option>
                  {pets.map((pet) => (
                    <option key={pet.pet_id} value={pet.pet_id}>
                      {pet.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#14b8a6] to-[#0ea5e9] text-white font-bold text-[14px] rounded-[11px] py-3 px-6 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 mt-6"
              >
                <Plus className="size-4" />
                Thêm
              </button>
            </form>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="size-5 text-gray-600" />
        </button>
      </div>
    </div>,
    document.body
  );
}