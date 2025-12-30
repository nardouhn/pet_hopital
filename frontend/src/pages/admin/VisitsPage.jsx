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
} from "lucide-react";
import { api } from "@/api/mockApi";

export default function VisitsPage() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("12-21-2025");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedService, setSelectedService] = useState("all");
  const [selectedDoctor, setSelectedDoctor] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    api.getVisits().then((data) => {
      setVisits(data);
      setLoading(false);
    });
  }, []);

  // Calculate stats for today
  const todayVisits = visits.filter((v) => v.date === selectedDate);
  const waitingCount = todayVisits.filter((v) => v.status === "Chờ").length;
  const inProgressCount = todayVisits.filter(
    (v) => v.status === "Đang khám"
  ).length;
  const completedCount = todayVisits.filter(
    (v) => v.status === "Hoàn thành"
  ).length;
  const totalTodayCount = todayVisits.length;

  // Apply filters
  const filteredVisits = visits.filter((visit) => {
    const matchesDate = selectedDate === "all" || visit.date === selectedDate;
    const matchesStatus =
      selectedStatus === "all" || visit.status === selectedStatus;
    const matchesService =
      selectedService === "all" || visit.service === selectedService;
    const matchesDoctor =
      selectedDoctor === "all" || visit.doctor === selectedDoctor;
    const matchesSearch =
      searchTerm === "" ||
      visit.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.ownerName.toLowerCase().includes(searchTerm.toLowerCase());

    return (
      matchesDate &&
      matchesStatus &&
      matchesService &&
      matchesDoctor &&
      matchesSearch
    );
  });

  const handleApplyFilter = () => {
    // Filters are applied in real-time, this is just for UI feedback
    console.log("Filters applied");
  };

  const handleReset = () => {
    setSelectedDate("12-21-2025");
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
          <p className="text-sm text-gray-600 mb-2">Đã xong hôm nay</p>
          <p className="text-3xl font-bold text-gray-900">{completedCount}</p>
        </div>

        {/* Total Today */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <FileText className="size-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">Tổng đơn hôm nay</p>
          <p className="text-3xl font-bold text-gray-900">{totalTodayCount}</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          {/* Date */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Date</label>
            <input
              type="text"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-transparent"
              placeholder="12-21-2025"
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
              <option value="all">All Statuses</option>
              <option value="Hoàn thành">Hoàn thành</option>
              <option value="Đang khám">Đang khám</option>
              <option value="Chờ">Chờ</option>
              <option value="Hoàn trả">Hoàn trả</option>
            </select>
          </div>

          {/* Service */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Service</label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-transparent"
            >
              <option value="all">All Services</option>
              <option value="Check-up">Check-up</option>
              <option value="Vaccination">Vaccination</option>
              <option value="Dental">Dental</option>
              <option value="Surgery">Surgery</option>
              <option value="Follow-up">Follow-up</option>
            </select>
          </div>

          {/* Doctor */}
          <div>
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
          </div>

          {/* Search Pet/Owner */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Search Pet / Owner
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
          <button
            onClick={handleApplyFilter}
            className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors"
          >
            Apply Filter
          </button>
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
          <h2 className="text-lg font-semibold text-gray-900">
            Lượt khám hôm nay
          </h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors">
            <Plus className="size-4" />
            Thêm lượt
          </button>
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
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SERVICE
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DOCTOR
                </th>
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
                        {visit.slotId}
                      </span>
                    </td>

                    {/* Check-in */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-teal-600 font-medium">
                        {visit.checkIn}
                      </span>
                    </td>

                    {/* Check-out */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {visit.checkOut}
                      </span>
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

                    {/* Service */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {visit.service}
                      </span>
                    </td>

                    {/* Doctor */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {visit.doctor}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          visit.status
                        )}`}
                      >
                        {visit.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                          <ExternalLink className="size-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                          <Trash2 className="size-4" />
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
    </div>
  );
}
