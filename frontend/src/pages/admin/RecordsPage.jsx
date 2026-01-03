import { useState, useEffect } from "react";
import {
  FileText,
  TrendingUp,
  Clock,
  Download,
  ArrowLeft,
  Printer,
  Calendar,
  User,
  Stethoscope,
  Filter,
} from "lucide-react";
import { api } from "@/api/mockApi";

export default function RecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalReports: 0, finishedReports: 0 });
  const [view, setView] = useState("overview"); // 'overview', 'all', 'detail'
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Filters for all records view
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");

  // Options loaded from backend
  const [servicesOptions, setServicesOptions] = useState([]);
  const [doctorsOptions, setDoctorsOptions] = useState([]);

  useEffect(() => {
    // Load services and doctors for filters; fall back to empty arrays on error
    api.getAdminServices()
      .then((rows) => setServicesOptions(rows || []))
      .catch((e) => {
        console.error('Failed to load services', e);
        setServicesOptions([]);
      });

    api.getAdminDoctors()
      .then((rows) => setDoctorsOptions(rows || []))
      .catch((e) => {
        console.error('Failed to load doctors', e);
        setDoctorsOptions([]);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getMedicalRecords(), api.getReportsStats()])
      .then(([recordsData, statsData]) => {
        setRecords(recordsData || []);
        setStats(statsData || { totalReports: 0, finishedReports: 0 });
      })
      .catch((err) => {
        console.error('RecordsPage init error', err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedReportId) {
      api.getMedicalRecordByReportId(selectedReportId).then((data) => {
        setSelectedRecord(data);
      });
    }
  }, [selectedReportId]);

  // Format helpers (Vietnamese format: DD/MM/YYYY and HH:MM)
  const formatVNDate = (iso) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso;
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    } catch (e) {
      return iso;
    }
  };

  const formatVNTime = (isoOrTime) => {
    if (!isoOrTime) return '—';
    try {
      // If already HH:MM or HH:MM:SS, return HH:MM
      const m = String(isoOrTime).match(/^(\d{1,2}:\d{2})/);
      if (m) return m[1];
      const d = new Date(isoOrTime);
      if (Number.isNaN(d.getTime())) return isoOrTime;
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${hh}:${mm}`;
    } catch (e) {
      return isoOrTime;
    }
  };

  // Calculate stats
  const totalRecords = stats.totalReports || records.length;
  const recordsThisMonth = records.filter((r) => {
    const recordMonth = new Date(r.reportDate).getMonth();
    const currentMonth = new Date().getMonth();
    return recordMonth === currentMonth;
  }).length;
  const pendingRecords = Math.max(0, (stats.totalReports || 0) - (stats.finishedReports || 0));

  // Filter records
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      searchTerm === "" ||
      record.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || (record.status && record.status.trim() === statusFilter);
    const matchesService =
      serviceFilter === "all" || record.serviceType === serviceFilter;
    const matchesDoctor =
      doctorFilter === "all" || record.doctorName === doctorFilter;

    return matchesSearch && matchesStatus && matchesService && matchesDoctor;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Đã khám xong":
        return "bg-green-100 text-green-700";
      case "Đang chờ khám":
        return "bg-yellow-100 text-yellow-700";
      case "Đang khám":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const handleViewDetail = (reportId) => {
    setSelectedReportId(reportId);
    setView("detail");
  };

  const handleBackToOverview = () => {
    setView("overview");
    setSelectedReportId(null);
    setSelectedRecord(null);
  };

  const handleBackToAll = () => {
    setView("all");
    setSelectedReportId(null);
    setSelectedRecord(null);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  // Detail View
  if (view === "detail" && selectedRecord) {
    return (
      <div className="p-6 space-y-6 bg-[#f8fafb] min-h-screen">
        {/* Back Button */}
        <button
          onClick={handleBackToAll}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Quay lại hồ sơ bệnh án</span>
        </button>

        {/* Header with Title and Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {selectedRecord.serviceType}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="size-4" />
                <span>{formatVNDate(selectedRecord.reportDate)}</span>
                <span>•</span>
                <Clock className="size-4" />
                <span>{formatVNTime(selectedRecord.reportTime || selectedRecord.reportDate)}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRecord.status)}`}>
                {selectedRecord.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
              <Printer className="size-4" />
              <span>Print</span>
            </button> */}
            <button
              onClick={() => api.downloadReportPdf(selectedRecord.reportId)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors"
            >
              <Download className="size-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Info Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Report ID */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-teal-50 rounded-lg">
                <FileText className="size-5 text-teal-600" />
              </div>
              <span className="text-sm text-gray-600">Report ID</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {selectedRecord.reportId}
            </p>
          </div>

          

          {/* Attending Doctor */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <User className="size-5 text-purple-600" />
              </div>
              <span className="text-sm text-gray-600">Attending Doctor</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {selectedRecord.doctorName}
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pet Information */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-teal-50 rounded-lg">
                <User className="size-5 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Pet Information
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pet ID</span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedRecord.petId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Name</span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedRecord.petName}
                </span>
              </div>
              {/* <div className="flex justify-between">
                <span className="text-sm text-gray-600">Species</span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedRecord.petSpecies}
                </span>
              </div> */}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Breed</span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedRecord.petBreed}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Age</span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedRecord.petAge}
                </span>
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <User className="size-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Owner Information
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Owner ID</span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedRecord.ownerId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Owner Name</span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedRecord.ownerName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Details */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-50 rounded-lg">
              <Stethoscope className="size-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Medical Details
            </h3>
          </div>

          <div className="space-y-6">
            {/* Symptoms */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Triệu chứng
              </h4>
              <div className="flex gap-2">
                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                  {selectedRecord.symptoms.join(', ')}
                </span>
              </div>
            </div>

            {/* Diagnosis */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Chẩn đoán
              </h4>
              <div className="flex gap-2">
                {selectedRecord.treatmentDetails.map((detail, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm"
                  >
                    {detail}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Dịch vụ
              </h4>
              <div className="flex gap-2">
                {(selectedRecord.services && selectedRecord.services.length > 0)
                  ? selectedRecord.services.map((s, i) => (
                      <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">{s}</span>
                    ))
                  : <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">{selectedRecord.serviceType}</span>
                }
              </div>
            </div>

            {/* Medical History */}
            {/* <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Chi tiết điều trị
              </h4>
              <div className="flex gap-2">
                {selectedRecord.medicalHistory.map((item, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div> */}

            {/*Chi tiết điều trị */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Chi tiết điều trị
              </h4>
              <div className="flex gap-2 flex-wrap">
                {(selectedRecord.medicalHistory || []).map((med, index) => {
                  // med may be a string or an object { name, quantity }
                  const name = typeof med === 'string' ? med : (med.name || med.medicine_name || med.med_name || '');
                  const qty = typeof med === 'string' ? null : (med.quantity ?? med.qty ?? null);
                  return (
                    <div key={index} className="bg-blue-50 text-blue-700 rounded-lg text-sm p-3">
                      <p className="text-sm font-medium">{name}</p>
                      {qty !== null && (
                        <p className="text-xs text-gray-500">Số lượng: {qty}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            
            {/* Prescription */}
            {/* <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Chỉ định
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Số lượng</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedRecord.dosage}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Liều lượng</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedRecord.frequency}
                  </p>
                </div>
              </div>
            </div> */}

            {/* Medical Condition
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">

              </h4>
              <p className="text-sm text-gray-600">
                {selectedRecord.medicalCondition}
              </p>
            </div> */}
          </div>
        </div>

        {/* Medical Images */}
        {selectedRecord.images && selectedRecord.images.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-50 rounded-lg">
                <FileText className="size-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Medical Images
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {selectedRecord.images.map((image, index) => (
                <div
                  key={index}
                  className="aspect-[4/3] rounded-xl overflow-hidden"
                >
                  <img
                    src={image}
                    alt={`Medical image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // All Records View
  if (view === "all") {
    return (
      <div className="p-6 space-y-6 bg-[#f8fafb] min-h-screen">
        {/* Back Button */}
        <button
          onClick={handleBackToOverview}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Quay lại hồ sơ bệnh án</span>
        </button>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hồ sơ bệnh án</h1>
          <p className="text-sm text-gray-600 mt-1">Tất cả hồ sơ bệnh án</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Search pet or owner...
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type name..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-200"
              />
            </div>

            {/* Date Range */}
            {/* <div>
              <label className="block text-sm text-gray-600 mb-2">
                Date Range
              </label>
              <input
                type="text"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                placeholder="Select date range"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-200"
              />
            </div> */}

            {/* All Status */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                All Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-200"
              >
                <option value="all">All Status</option>
                <option value="Đã khám xong">Đã khám xong</option>
                <option value="Đang chờ khám">Đang chờ khám</option>
                <option value="Đang khám">Đang khám</option>
              </select>
            </div>

            {/* All Services */}
            {/* <div>
              <label className="block text-sm text-gray-600 mb-2">
                All Services
              </label>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-200"
              >
                <option value="all">All Services</option>
                {servicesOptions && servicesOptions.length > 0 ? (
                  servicesOptions.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Khám tổng quát">Khám tổng quát</option>
                    <option value="Tiêm vacxin">Tiêm vacxin</option>
                    <option value="Khám răng">Khám răng</option>
                    <option value="Cấp cứu">Cấp cứu</option>
                    <option value="Da liễu">Da liễu</option>
                  </>
                )}
              </select>
            </div> */}

            {/* All Doctors */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                All Doctors
              </label>
              <select
                value={doctorFilter}
                onChange={(e) => setDoctorFilter(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-200"
              >
                <option value="all">All Doctors</option>
                {doctorsOptions && doctorsOptions.length > 0 ? (
                  doctorsOptions.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Dr. Emily Carter">Dr. Emily Carter</option>
                    <option value="Dr. James Wilson">Dr. James Wilson</option>
                    <option value="Dr. Sarah Martinez">Dr. Sarah Martinez</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    REPORT ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PET NAME
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    OWNER
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DOCTOR
                  </th>
                  {/* <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SERVICE
                  </th> */}
                  {/* <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    REPORT DATE
                  </th> */}
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewDetail(record.reportId)}
                        className="text-sm font-medium text-teal-600 hover:text-teal-700"
                      >
                        {record.reportId}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {record.petName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {record.petSpecies} - {record.petBreed}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {record.ownerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {record.doctorName}
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.serviceType}
                    </td> */}
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.reportDate}
                      </div>
                      <div className="text-xs text-gray-500">
                        {record.reportTime}
                      </div>
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          record.status
                        )}`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewDetail(record.reportId)}
                        className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            {/* <span className="text-sm text-gray-600">
              Showing 1 to 5 of {filteredRecords.length} reports
            </span> */}
            <div className="flex items-center gap-2">
              {/* <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                Previous
              </button>
              <button className="px-3 py-1.5 text-sm bg-teal-500 text-white rounded-lg">
                1
              </button>
              <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                2
              </button> */}
              {/* <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                Next
              </button> */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Overview (default view)
  return (
    <div className="p-6 space-y-6 bg-[#f8fafb] min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hồ sơ bệnh án</h1>
        <p className="text-sm text-gray-600 mt-1">Tổng quan</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Reports */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-teal-50 rounded-xl">
              <FileText className="size-6 text-teal-600" />
            </div>
            <span className="text-xs text-teal-600 font-medium"></span>
          </div>
          <p className="text-sm text-gray-600 mb-2">Tổng số</p>
          <p className="text-3xl font-bold text-gray-900">{totalRecords}</p>
        </div>

        {/* This Month */}
        {/* <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <TrendingUp className="size-6 text-blue-600" />
            </div>
            <span className="text-xs text-blue-600 font-medium">+8%</span>
          </div>
          <p className="text-sm text-gray-600 mb-2">Số lượng tháng này</p>
          <p className="text-3xl font-bold text-gray-900">{recordsThisMonth}</p>
        </div> */}

        {/* Pending */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-yellow-50 rounded-xl">
              <Clock className="size-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">Đã hoàn thành</p>
          <p className="text-3xl font-bold text-gray-900">{totalRecords-pendingRecords}</p>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Báo cáo gần đây
          </h2>
          <button
            onClick={() => setView("all")}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
          >
            Xem thêm
            <span className="text-lg">→</span>
          </button>
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {records.slice(0, 3).map((record) => (
            <div
              key={record.id}
              className="bg-gray-50 rounded-xl p-6 border border-gray-100"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-900">
                  {record.reportId}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    record.status
                  )}`}
                >
                  {record.status}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Pet Name:</p>
                  <p className="text-sm font-medium text-gray-900">
                    {record.petName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Owner:</p>
                  <p className="text-sm text-gray-700">{record.ownerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Doctor:</p>
                  <p className="text-sm text-gray-700">{record.doctorName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Date:</p>
                  <p className="text-sm text-gray-700">{formatVNDate(record.reportDate)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleViewDetail(record.reportId)}
                  className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium"
                >
                  Detail
                </button>
                <button
                  onClick={() => api.downloadReportJson(record.reportId)}
                  className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="size-4 text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}