import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Star,
  Clock,
  ChevronDown
} from 'lucide-react';

// State-driven data fetched from backend `/admin/statistics`

export default function StatisticsPage() {
  const [selectedMonth] = useState('Tháng 1, 2026');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    revenueLast7Days: {},
    totalAppointments: 0,
    appointmentsThisWeek: {},
    topServices: [],
    performance: 0,
    monthlyRevenue: {},
    petSpeciesRatio: [],
    peakHours: []
  });

  useEffect(() => {
    let mounted = true;
    const token = (() => {
      try {
        const a = localStorage.getItem('auth');
        return a ? JSON.parse(a).accessToken : null;
      } catch (e) { return null; }
    })();

    fetch('/admin/statistics', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    }).then(r => r.json()).then(payload => {
      if (!mounted) return;
      const data = payload?.data || payload || {};
      setStats({
        totalRevenue: data.totalRevenue || 0,
        revenueLast7Days: data.revenueLast7Days || {},
        totalAppointments: data.totalAppointments || 0,
        appointmentsThisWeek: data.appointmentsThisWeek || {},
        topServices: data.topServices || [],
        performance: data.performance || 0,
        monthlyRevenue: data.monthlyRevenue || {},
        petSpeciesRatio: data.petSpeciesRatio || [],
        peakHours: data.peakHours || []
      });
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load statistics', err);
      if (!mounted) return;
      setError(err.message || String(err));
      setLoading(false);
    });

    return () => { mounted = false; };
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  // Derive UI-friendly datasets from `stats`
  const revenueLast7Entries = Object.entries(stats.revenueLast7Days || {}).map(([k, v]) => ({ day: k, revenue: v }));
  revenueLast7Entries.sort((a, b) => new Date(a.day) - new Date(b.day));
  const revenueLast7Total = revenueLast7Entries.reduce((s, it) => s + (Number(it.revenue) || 0), 0);

  const appointmentsEntries = Object.entries(stats.appointmentsThisWeek || {}).map(([k, v]) => ({ dateIso: k, appointments: v }));
  appointmentsEntries.sort((a, b) => new Date(a.dateIso) - new Date(b.dateIso));
  const appointmentsChartData = appointmentsEntries.map(it => {
    const d = new Date(it.dateIso);
    const weekday = d.toLocaleDateString('vi-VN', { weekday: 'short' });
    const day = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2,'0')}`;
    return { date: weekday, day, appointments: it.appointments };
  });

  const topServicesData = (stats.topServices || []).map((s, idx) => ({
    name: s.service_name || s.name || `Service ${idx+1}`,
    count: s.count || 0,
    color: s.color || ['#14b8a6','#3b82f6','#8b5cf6','#f59e0b'][idx % 4]
  }));

  // Feedback: backend provides `performance` (percentage). Provide a fallback small dataset.
  const feedbackData = (Array.isArray(stats.feedbackRatings) && stats.feedbackRatings.length > 0)
    ? stats.feedbackRatings
    : [{ stars: Math.round((stats.performance || 0) * 5 / 100), count: Math.round((stats.performance || 0)), percentage: stats.performance || 0 }];

  // monthlyRevenue: convert { '2026-01-01': 123 } -> [{day:1, revenue:...}, ...]
  const monthlyRevenueArr = [];
  Object.entries(stats.monthlyRevenue || {}).forEach(([iso, val]) => {
    try {
      const d = new Date(iso);
      // store iso so we can show full date (dd/mm/yyyy) in the UI
      monthlyRevenueArr.push({ iso, day: d.getDate(), revenue: Number(val) || 0 });
    } catch (e) {}
  });
  monthlyRevenueArr.sort((a,b) => new Date(a.iso) - new Date(b.iso));

  const petDistribution = (stats.petSpeciesRatio || []).map(p => ({
    type: p.species === 'Dog' ? 'Chó' : p.species === 'Cat' ? 'Mèo' : 'Khác',
    count: Math.round((p.percent || 0)),
    percentage: p.percent || 0,
    color: p.species === 'Dog' ? '#14b8a6' : p.species === 'Cat' ? '#3b82f6' : '#f59e0b'
  }));

  const peakSlots = (stats.peakHours || []).map(h => ({ time: h, count: 0, percentage: 0 }));

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thống kê & Báo cáo</h1>
          <p className="text-sm text-gray-500 mt-1">Tổng quan hoạt động phòng khám</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="size-4 text-gray-600" />
            <span className="text-sm text-gray-700">{selectedMonth}</span>
            {/* <ChevronDown className="size-4 text-gray-400" /> */}
          </button>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-teal-500 p-3 rounded-lg">
              <DollarSign className="size-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-gray-900">
                {((stats.totalRevenue || 0) / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
        </div>

        {/* Revenue Last 7 Days with Mini Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-500 p-3 rounded-lg">
              <TrendingUp className="size-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Doanh thu 7 ngày qua</p>
              <p className="text-2xl font-bold text-gray-900">
                {(revenueLast7Total / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
          <MiniRevenueChart data={revenueLast7Entries.map(it => ({ day: it.day, revenue: it.revenue }))} />
        </div>

        {/* Total Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-500 p-3 rounded-lg">
              <Calendar className="size-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng số lượt khám</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalAppointments}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1: Appointments Last 7 Days & Top Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments Last 7 Days */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Lượt khám 7 ngày qua</h3>
          <AppointmentsBarChart data={appointmentsChartData} />
        </div>

        {/* Top 4 Services */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top 4 dịch vụ được sử dụng nhiều nhất</h3>
          <TopServicesChart data={topServicesData} />
        </div>
      </div>

      {/* Charts Row 2: Feedback & Calendar Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feedback Ratings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Đánh giá phản hồi</h3>
          <FeedbackChart data={feedbackData} />
        </div>

        {/* Calendar Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Doanh thu theo ngày</h3>
          <CalendarRevenueView data={monthlyRevenueArr} />
        </div>
      </div>

      {/* Charts Row 3: Pet Distribution & Peak Times */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        Pet Type Distribution
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Tỷ lệ chó, mèo và các loại khác</h3>
          <PetDistributionChart data={petDistribution} />
        </div>

        Peak Time Slots
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top 4 khung giờ cao điểm</h3>
          <PeakTimeSlotsChart data={peakSlots} />
        </div>
      </div> */}
    </div>
  );
}

// Mini Revenue Chart for Card
function MiniRevenueChart({ data }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="h-12 flex items-center justify-center text-xs text-gray-500">Không có dữ liệu</div>;
  }
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  
  return (
    <div className="h-12 flex items-end gap-1">
      {data.map((item, idx) => {
        const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
        return (
          <div 
            key={idx} 
            className="flex-1 bg-blue-400 rounded-t transition-all hover:bg-blue-500"
            style={{ height: `${height}%`, minHeight: '4px' }}
            title={`${item.day}: ${(item.revenue / 1000000).toFixed(1)}M`}
          />
        );
      })}
    </div>
  );
}

// Appointments Bar Chart
function AppointmentsBarChart({ data }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-sm text-gray-500">Không có dữ liệu</div>;
  }
  const maxValue = Math.max(...data.map(d => d.appointments));
  const chartHeight = 250;
  
  return (
    <div className="h-[300px] flex flex-col">
      <div className="relative flex items-end gap-2 pb-6" style={{ height: `${chartHeight}px` }}>
        {data.map((item, idx) => {
          const height = (item.appointments / maxValue) * chartHeight;
          return (
            <div key={idx} className="flex-1 flex flex-col justify-end items-center group relative">
              <div 
                className="w-full bg-teal-500 rounded-t transition-all hover:bg-teal-600 cursor-pointer"
                style={{ height: `${height}px`, minHeight: '4px' }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  {item.appointments} lượt
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 text-xs text-gray-600">
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 text-center">
            <div className="font-semibold">{item.date}</div>
            <div className="text-[10px] text-gray-400">{item.day}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Top Services Horizontal Bar Chart
function TopServicesChart({ data }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-sm text-gray-500">Không có dữ liệu</div>;
  }
  const maxCount = Math.max(...data.map(d => d.count));
  
  return (
    <div className="space-y-4 h-[300px] flex flex-col justify-center">
      {data.map((item, idx) => {
        const width = (item.count / maxCount) * 100;
        return (
          <div key={idx}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-700">{item.name}</span>
              <span className="text-sm font-semibold text-gray-900">{item.count}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-6 relative overflow-hidden">
              <div 
                className="h-full rounded-full transition-all"
                style={{ 
                  width: `${width}%`,
                  backgroundColor: item.color
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Feedback Rating Chart
function FeedbackChart({ data }) {
  const totalCount = data.reduce((sum, item) => sum + (item.count || 0), 0);
  const averageRating = totalCount > 0
    ? (data.reduce((sum, item) => sum + (item.stars || 0) * (item.count || 0), 0) / totalCount).toFixed(1)
    : (data[0] && data[0].percentage ? ((data[0].stars || 0) + '.0') : '0.0');
  
  return (
    <div className="h-[300px] flex flex-col">
      <div className="flex items-center justify-center mb-6 pb-4 border-b">
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center mb-1">
            <Star className="size-8 fill-yellow-400 text-yellow-400" />
            <span className="text-4xl font-bold text-gray-900">{averageRating}</span>
          </div>
          <p className="text-sm text-gray-500">{totalCount} đánh giá</p>
        </div>
      </div>
      
      <div className="space-y-3 flex-1">
        {totalCount === 0 ? (
          <div className="text-center text-sm text-gray-500">Chưa có đánh giá</div>
        ) : (
          data.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-16">
                <span className="text-sm text-gray-600">{item.stars}</span>
                <Star className="size-3 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex-1 bg-gray-100 rounded-full h-4 relative overflow-hidden">
                <div 
                  className="h-full bg-yellow-400 rounded-full transition-all"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">{item.count}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Calendar Revenue View
function CalendarRevenueView({ data }) {
  // Render a simple list of days and revenue for the current month
  // Input: data = [{ day: <number>, revenue: <number> }, ...]
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="h-[200px] flex items-center justify-center text-sm text-gray-500">Không có dữ liệu</div>;
  }

  // Ensure sorted by full date (iso)
  const sorted = [...data].sort((a, b) => new Date(a.iso) - new Date(b.iso));

  return (
    <div className="bg-white rounded-xl p-4">
      <div className="space-y-2">
        {sorted.map((d, idx) => {
          const fullDate = d.iso ? new Date(d.iso).toLocaleDateString('vi-VN') : `Ngày ${d.day}`;
          return (
            <div key={idx} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div className="text-sm text-gray-700">{fullDate}</div>
              <div className="text-sm font-semibold text-gray-900">{(Number(d.revenue) || 0).toLocaleString('vi-VN')} đ</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Pet Distribution Donut Chart
function PetDistributionChart({ data }) {
  const total = data.reduce((sum, item) => sum + (item.count || 0), 0);
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-sm text-gray-500">Không có dữ liệu</div>;
  }
  
  return (
    <div className="h-[300px] flex items-center justify-center gap-8">
      {/* Donut Chart */}
      <div className="relative size-48">
        <svg className="size-full -rotate-90" viewBox="0 0 100 100">
          {data.reduce((acc, item, idx) => {
            const percentage = (item.count / total) * 100;
            const circumference = 2 * Math.PI * 40;
            const offset = acc.offset;
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
            
            acc.elements.push(
              <circle
                key={idx}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={item.color}
                strokeWidth="12"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={-offset}
              />
            );
            
            acc.offset += (percentage / 100) * circumference;
            return acc;
          }, { elements: [], offset: 0 }).elements}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{total}</p>
            <p className="text-xs text-gray-500">Tổng</p>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="space-y-3">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div 
              className="size-4 rounded"
              style={{ backgroundColor: item.color }}
            />
            <div>
              <p className="text-sm font-semibold text-gray-700">{item.type}</p>
              <p className="text-xs text-gray-500">{item.count} ({item.percentage}%)</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Peak Time Slots Chart
function PeakTimeSlotsChart({ data }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-sm text-gray-500">Không có dữ liệu</div>;
  }
  const maxCount = Math.max(...data.map(d => d.count));
  
  return (
    <div className="space-y-4 h-[300px] flex flex-col justify-center">
      {data.map((item, idx) => (
        <div key={idx}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">{item.time}</span>
            </div>
            <span className="text-sm font-bold text-gray-900">{item.count} lượt</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-6 relative overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all flex items-center justify-end pr-2"
              style={{ width: `${item.percentage}%` }}
            >
              <span className="text-xs text-white font-semibold">{item.percentage}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}