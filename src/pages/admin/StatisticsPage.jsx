import { useState } from "react";
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  Activity,
  Package,
  ChevronDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Mock data for December 2025 statistics
const monthlyStats = {
  totalAppointments: 342,
  appointmentsGrowth: "+12.5%",
  totalRevenue: 128500000, // VND
  revenueGrowth: "+18.3%",
  totalPatients: 218,
  patientsGrowth: "+8.7%",
  totalServices: 456,
  servicesGrowth: "+15.2%",
};

// Daily appointments data for December 2025
const dailyAppointments = [
  { date: "01/12", appointments: 12, revenue: 4200000 },
  { date: "02/12", appointments: 15, revenue: 5100000 },
  { date: "03/12", appointments: 10, revenue: 3800000 },
  { date: "04/12", appointments: 18, revenue: 6200000 },
  { date: "05/12", appointments: 14, revenue: 4900000 },
  { date: "06/12", appointments: 16, revenue: 5500000 },
  { date: "07/12", appointments: 11, revenue: 4100000 },
  { date: "08/12", appointments: 13, revenue: 4600000 },
  { date: "09/12", appointments: 19, revenue: 6800000 },
  { date: "10/12", appointments: 12, revenue: 4300000 },
  { date: "11/12", appointments: 17, revenue: 5900000 },
  { date: "12/12", appointments: 14, revenue: 5000000 },
  { date: "13/12", appointments: 16, revenue: 5600000 },
  { date: "14/12", appointments: 11, revenue: 4200000 },
  { date: "15/12", appointments: 13, revenue: 4700000 },
  { date: "16/12", appointments: 18, revenue: 6400000 },
  { date: "17/12", appointments: 15, revenue: 5300000 },
  { date: "18/12", appointments: 12, revenue: 4500000 },
  { date: "19/12", appointments: 14, revenue: 5100000 },
  { date: "20/12", appointments: 17, revenue: 6000000 },
  { date: "21/12", appointments: 13, revenue: 4800000 },
  { date: "22/12", appointments: 16, revenue: 5700000 },
  { date: "23/12", appointments: 10, revenue: 3900000 },
  { date: "24/12", appointments: 8, revenue: 3200000 },
  { date: "25/12", appointments: 9, revenue: 3500000 },
  { date: "26/12", appointments: 15, revenue: 5400000 },
  { date: "27/12", appointments: 18, revenue: 6300000 },
  { date: "28/12", appointments: 14, revenue: 5000000 },
  { date: "29/12", appointments: 16, revenue: 5800000 },
  { date: "30/12", appointments: 13, revenue: 4900000 },
];

// Appointment status distribution
const statusData = [
  { name: "Đã hoàn thành", value: 245, color: "#14b8a6" },
  { name: "Đã xác nhận", value: 58, color: "#3b82f6" },
  { name: "Đang chờ", value: 25, color: "#f59e0b" },
  { name: "Đã hủy", value: 14, color: "#ef4444" },
];

// Revenue by service type
const serviceRevenue = [
  { name: "Khám tổng quát", revenue: 42000000, count: 128 },
  { name: "Tiêm vaccine", revenue: 28500000, count: 95 },
  { name: "Phẫu thuật", revenue: 35000000, count: 42 },
  { name: "Spa & Grooming", revenue: 12500000, count: 87 },
  { name: "Khám chuyên khoa", revenue: 8500000, count: 34 },
  { name: "Cấp cứu", revenue: 2000000, count: 12 },
];

// Top doctors by appointments
const topDoctors = [
  {
    name: "Dr. Nguyễn Văn An",
    appointments: 78,
    revenue: 32500000,
    specialty: "Nội khoa",
  },
  {
    name: "Dr. Trần Thị Bình",
    appointments: 65,
    revenue: 28200000,
    specialty: "Phẫu thuật",
  },
  {
    name: "Dr. Lê Hoàng Cường",
    appointments: 58,
    revenue: 24800000,
    specialty: "Da liễu",
  },
  {
    name: "Dr. Phạm Minh Đức",
    appointments: 52,
    revenue: 21500000,
    specialty: "Nha khoa",
  },
  {
    name: "Dr. Hoàng Thị Em",
    appointments: 45,
    revenue: 18900000,
    specialty: "Nội khoa",
  },
];

// Medicine usage statistics
const medicineUsage = [
  { name: "Antibiotics", quantity: 145, revenue: 8700000 },
  { name: "Vaccines", quantity: 95, revenue: 28500000 },
  { name: "Pain Relief", quantity: 78, revenue: 3900000 },
  { name: "Vitamins", quantity: 134, revenue: 6700000 },
  { name: "Anti-parasitic", quantity: 89, revenue: 5340000 },
];

// Recent invoices
const recentInvoices = [
  {
    id: "INV-001234",
    pet: "Max",
    owner: "Nguyễn Văn A",
    amount: 1500000,
    date: "30/12/2025",
    status: "Đã thanh toán",
  },
  {
    id: "INV-001235",
    pet: "Luna",
    owner: "Trần Thị B",
    amount: 2800000,
    date: "30/12/2025",
    status: "Đã thanh toán",
  },
  {
    id: "INV-001236",
    pet: "Charlie",
    owner: "Lê Văn C",
    amount: 950000,
    date: "29/12/2025",
    status: "Đã thanh toán",
  },
  {
    id: "INV-001237",
    pet: "Bella",
    owner: "Phạm Thị D",
    amount: 3200000,
    date: "29/12/2025",
    status: "Chưa thanh toán",
  },
  {
    id: "INV-001238",
    pet: "Rocky",
    owner: "Hoàng Văn E",
    amount: 1750000,
    date: "28/12/2025",
    status: "Đã thanh toán",
  },
];

export default function StatisticsPage() {
  const [selectedMonth] = useState("Tháng 12, 2025");

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Thống kê & Báo cáo
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tổng quan hoạt động phòng khám
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="size-4 text-gray-600" />
            <span className="text-sm text-gray-700">{selectedMonth}</span>
            <ChevronDown className="size-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Calendar}
          title="Tổng lượt khám"
          value={monthlyStats.totalAppointments.toLocaleString()}
          growth={monthlyStats.appointmentsGrowth}
          color="bg-blue-500"
        />
        <StatCard
          icon={DollarSign}
          title="Doanh thu"
          value={`${(monthlyStats.totalRevenue / 1000000).toFixed(1)}M`}
          growth={monthlyStats.revenueGrowth}
          color="bg-teal-500"
        />
        <StatCard
          icon={Users}
          title="Bệnh nhân"
          value={monthlyStats.totalPatients.toLocaleString()}
          growth={monthlyStats.patientsGrowth}
          color="bg-purple-500"
        />
        <StatCard
          icon={Package}
          title="Dịch vụ sử dụng"
          value={monthlyStats.totalServices.toLocaleString()}
          growth={monthlyStats.servicesGrowth}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Appointments Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Lượt khám theo ngày
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyAppointments}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line
                type="monotone"
                dataKey="appointments"
                stroke="#14b8a6"
                strokeWidth={2}
                name="Lượt khám"
                dot={{ fill: "#14b8a6", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Appointment Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Phân bổ trạng thái
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Service */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Doanh thu theo dịch vụ
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={serviceRevenue} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                type="number"
                stroke="#9ca3af"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#9ca3af"
                style={{ fontSize: "12px" }}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value) => `${(value / 1000000).toFixed(1)}M VND`}
              />
              <Bar dataKey="revenue" fill="#14b8a6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Revenue Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Doanh thu theo ngày
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyAppointments}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value) => `${(value / 1000000).toFixed(1)}M VND`}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                fill="#93c5fd"
                name="Doanh thu"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Doctors */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Top bác sĩ</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Bác sĩ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Lượt khám
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Doanh thu
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topDoctors.map((doctor, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {doctor.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {doctor.specialty}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {doctor.appointments}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {(doctor.revenue / 1000000).toFixed(1)}M
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Hóa đơn gần đây</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Mã HĐ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Thú cưng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Số tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentInvoices.map((invoice, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {invoice.id}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {invoice.pet}
                        </p>
                        <p className="text-xs text-gray-500">{invoice.owner}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {(invoice.amount / 1000000).toFixed(1)}M
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          invoice.status === "Đã thanh toán"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Medicine Usage */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Sử dụng thuốc & vật tư y tế
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={medicineUsage}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              stroke="#9ca3af"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Bar
              dataKey="quantity"
              fill="#8b5cf6"
              name="Số lượng"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, growth, color }) {
  const isPositive = growth.startsWith("+");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="size-6 text-white" />
        </div>
        <div
          className={`flex items-center gap-1 text-sm ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          <TrendingUp className={`size-4 ${!isPositive && "rotate-180"}`} />
          <span>{growth}</span>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
