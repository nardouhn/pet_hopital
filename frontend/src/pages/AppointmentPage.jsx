import React, { useEffect, useState } from 'react';
import { PawPrint, User, Calendar, Stethoscope, FileText } from 'lucide-react';
import Navbar from '@/layouts/NavBar';
import Footer from '@/layouts/Footer';
import { getMyAppointments } from '@/api/mockApi';

// Simple, readable page that lists the current user's appointments
// Uses existing helpers (getMyAppointments) and site Navbar/Footer so style is consistent
export default function AppointmentHistory() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const data = await getMyAppointments();
        // normalize response to array
        const rows = Array.isArray(data) ? data : data?.data || data?.appointments || [];
        if (mounted) setAppointments(rows);
      } catch (err) {
        console.error('Failed to load appointments', err);
        if (mounted) setError(err?.message || 'Không thể tải lịch hẹn');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetch();
    return () => { mounted = false; };
  }, []);

  const getStatusLabel = (status) => {
    // Accept both english and Vietnamese status variants
    switch ((status || '').toString().toLowerCase()) {
      case 'pending':
      case 'đang chờ xác nhận':
      case 'đang chờ':
        return { text: 'Đang chờ xác nhận', className: 'bg-[#e0f7f7] text-[#2e94a5]' };
      case 'confirmed':
      case 'đã xác nhận':
      case 'đặt lịch hẹn thành công':
        return { text: 'Đã xác nhận', className: 'bg-green-50 text-green-600' };
      case 'cancelled':
      case 'đã hủy':
        return { text: 'Đã hủy', className: 'bg-red-50 text-red-600' };
      case 'paid':
      case 'đã thanh toán':
        return { text: 'Đã thanh toán', className: 'bg-blue-50 text-blue-600' };
      default:
        return { text: status || 'Không xác định', className: 'bg-gray-100 text-gray-600' };
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50 via-emerald-50 to-emerald-100 font-sans text-gray-800">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto py-10 px-6">
        <h1 className="text-2xl font-bold mb-6">Tra cứu lịch hẹn</h1>

        {loading ? (
          <div className="bg-white rounded-xl shadow p-6">Đang tải...</div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow p-6 text-red-600">{error}</div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 text-center min-h-64 flex flex-col items-center justify-center">
            <p className="font-semibold">Bạn chưa có lịch hẹn nào.</p>
            <p className="text-sm text-gray-500 mt-2">Hãy đặt lịch để sử dụng dịch vụ của chúng tôi.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {appointments.map((appt, i) => {
              const status = getStatusLabel(appt.status);

              // Robust mapping: try multiple possible backend fields and nested objects
              const petName =
                appt.pet_name ||
                appt.petName ||
                (appt.pet && (appt.pet.name || appt.pet.pet_name || appt.pet.nickname)) ||
                (typeof appt.pet === 'string' ? appt.pet : null) ||
                null;

              const doctorName =
                appt.doctor_name ||
                appt.doctorName ||
                (appt.doctor && (appt.doctor.name || appt.doctor.full_name || appt.doctor.displayName)) ||
                (appt.doctor_id ? `BS. #${appt.doctor_id}` : null) ||
                (typeof appt.doctor === 'string' ? appt.doctor : null) ||
                null;

              const serviceName =
                appt.service ||
                appt.service_name ||
                appt.serviceName ||
                (appt.service && appt.service.name) ||
                appt.type ||
                null;

              const date = appt.booking_date || appt.date || appt.bookingDate || null;
              const timeslot = appt.timeslot || appt.time || appt.slot || '';

              const description = appt.description || appt.notes || appt.symptoms || appt.reason || null;

              // invoice may be a URL or an id; prefer URL if present
              const invoiceUrl = appt.invoice_url || appt.invoiceUrl || (appt.invoice && typeof appt.invoice === 'string' ? appt.invoice : null) || (appt.invoice_id ? `/invoices/${appt.invoice_id}` : null) || null;

              // Fallback text when information is missing
              const safe = (v, fallback = 'Chưa có thông tin') => (v === null || v === undefined || v === '') ? fallback : v;

              return (
                <div key={appt.appointment_id || appt.id || `appt-${i}`} className="relative bg-white rounded-2xl shadow-sm border border-gray-50 p-6">
                  <div className="grid grid-cols-12 gap-4 mt-0 items-start">
                    <div className="col-span-10">
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-4 space-y-2">
                          <div className="flex items-center gap-3 text-sm">
                            <PawPrint size={16} className="text-gray-400" />
                            <span className="font-bold">Tên thú cưng:</span>
                            <span className="text-gray-600">{safe(petName)}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <User size={16} className="text-gray-400" />
                            <span className="font-bold">Bác sĩ:</span>
                            <span className="text-gray-600">{safe(doctorName)}</span>
                          </div>
                        </div>

                        <div className="col-span-4 space-y-2">
                          <div className="flex items-center gap-3 text-sm">
                            <Stethoscope size={16} className="text-gray-400" />
                            <span className="font-bold">Dịch vụ:</span>
                            <span className="text-gray-600">{safe(serviceName)}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="font-bold">Mô tả:</span>
                            <span className="text-gray-600">{safe(description)}</span>
                          </div>
                        </div>

                        <div className="col-span-4 space-y-2 text-sm">
                          <div className="flex items-center gap-3">
                            <Calendar size={16} className="text-gray-400" />
                            <span className="font-bold">Lịch hẹn:</span>
                            <span className="text-[#2e94a5] font-semibold">{safe(date, '-')}{timeslot ? ` • ${timeslot}` : ''}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <FileText size={16} className="text-gray-400" />
                            {invoiceUrl ? (
                              <a href={invoiceUrl} target="_blank" rel="noreferrer" className="font-bold text-gray-700 hover:text-teal-600 underline decoration-dotted underline-offset-4">
                                Xem hóa đơn
                              </a>
                            ) : (
                              <span className="text-sm text-gray-500">Chưa có hóa đơn</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2 flex flex-col items-end">
                      <div className={`rounded-xl px-4 py-1 font-semibold text-sm ${status.className}`}>{status.text}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
