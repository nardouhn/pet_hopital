const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

// Use a relative base by default in development so Vite's dev server can proxy API requests
// when running inside Docker. Production builds can set VITE_API_BASE to an absolute URL.
// Support runtime overrides via a global `window.__API_BASE__` or a <meta name="api-base" content="..."> tag
const _runtimeBase = (typeof window !== 'undefined') ? (window.__API_BASE__ || document?.querySelector('meta[name="api-base"]')?.content) : null;
const BASE = _runtimeBase ?? import.meta.env.VITE_API_BASE ?? "";

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";

  // Try to attach authorization if available in localStorage
  try {
    const authRaw = localStorage.getItem("auth");
    const authObj = authRaw ? JSON.parse(authRaw) : null;
    const token = authObj?.accessToken || authObj?.token || authObj?.access_token;
    if (token && auth) headers["Authorization"] = `Bearer ${token}`;
  } catch (e) {
    // ignore parse errors
  }

  // Perform fetch and handle network/CORS errors explicitly
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    // Likely a network error or CORS block — surface a clearer message and log details
    console.error('Network or CORS error during fetch', { path, method, body, error: e });
    throw new Error(
      'Network error: không thể kết nối đến máy chủ. Có thể do lỗi mạng hoặc CORS. Chi tiết: ' +
        (e && e.message ? e.message : String(e))
    );
  }

  let json;
  try {
    json = await res.json();
  } catch (e) {
    json = null;
  }

  if (!res.ok) {
    const err = (json && (json.message || json.error)) || res.statusText;
    console.error('API error', { path, method, status: res.status, body, response: json });
    throw new Error(err);
  }

  return json;
}

/* ===== DASHBOARD ===== */
export async function getOverviewStats() {
  try {
    const [statsRes, petsRes, usersRes, apptStatsRes] = await Promise.all([
      request("/admin/statistics", { auth: true }),
      request("/admin/overview/total-pets", { auth: true }),
      request("/admin/overview/total-users", { auth: true }),
      request("/admin/appointments/stats", { auth: true }).catch(() => null),
    ]);

    const data = statsRes?.data || {};

    // Prefer the dedicated endpoints' values, fall back to /admin/statistics if present
    const totalPets = petsRes?.data?.totalPets ?? data.totalPets ?? 0;
    const totalUsers = usersRes?.data?.totalUsers ?? data.totalUsers ?? 0;
    // Prefer today's total from /admin/appointments/stats when available
    const totalAppointments = apptStatsRes?.data?.totalToday ?? data.totalAppointments ?? 0;
    const totalRevenue = data.totalRevenue ?? 0;

    return [
      { title: "Tổng thú cưng", value: totalPets },
      { title: "Người dùng", value: totalUsers },
      { title: "Lịch hôm nay", value: totalAppointments },
      { title: "Doanh thu", value: totalRevenue ? `₫${Number(totalRevenue).toLocaleString()}` : "₫0" },
    ];
  } catch (err) {
    console.error('getOverviewStats error', err);
    // Return zeroed stats if anything fails
    return [
      { title: "Tổng thú cưng", value: 0 },
      { title: "Người dùng", value: 0 },
      { title: "Lịch hôm nay", value: 0 },
      { title: "Doanh thu", value: "₫0" },
    ];
  }
}

// Get pet hotel occupancy (current / total)
export async function getPetHotelOccupancy() {
  try {
    const res = await request('/admin/overview/pet-hotel-occupancy', { auth: true });
    const data = res?.data || res || {};
    return {
      current: data.current || 0,
      total: data.total || 0,
      ratio: data.ratio || `${data.current || 0}/${data.total || 0}`,
    };
  } catch (err) {
    console.error('getPetHotelOccupancy error', err);
    return { current: 0, total: 0, ratio: '0/0' };
  }
}

// Get today's recent slots (returns { rows: [...], total_slots, new_pets } or legacy array)
export async function getTodayRecentSlots() {
  try {
    const res = await request('/admin/overview/today-recent-slots', { auth: true });
    // prefer data wrapper
    const payload = res?.data ?? res;
    if (Array.isArray(payload)) {
      return { rows: payload, total_slots: payload.length, new_pets: payload.length };
    }
    return {
      rows: payload?.rows || [],
      total_slots: payload?.total_slots || 0,
      new_pets: payload?.new_pets || 0,
    };
  } catch (err) {
    console.error('getTodayRecentSlots error', err);
    return { rows: [], total_slots: 0, new_pets: 0 };
  }
}

export async function getRecentAppointments() {
  try {
    // Use overview endpoint for today's recent slots (returns slot/check_in, pet_name, user_name, services, status)
    const res = await request('/admin/overview/today-recent-slots', { auth: true });
    // backward compatible: endpoint may return either array (old) or { rows: [...], ... }
    const payload = res?.data ?? res;
    const rows = Array.isArray(payload) ? payload : (payload?.rows || []);

    // Sort by check_in descending (latest first)
    rows.sort((a, b) => {
      const ad = a.check_in || 0;
      const bd = b.check_in || 0;
      return new Date(bd) - new Date(ad);
    });

    return rows.slice(0, 10).map((r) => {
      const aid = r.appointment_id || r.slot_id || null;
      return ({
        id: aid,
        appointment_id: aid,
        pet: r.pet_name || '-',
        owner: r.user_name || '-',
        // Prefer explicit doctor_name if provided, otherwise fallback to first service or '-'
        doctor: r.doctor_name || ((Array.isArray(r.services) && r.services.length > 0) ? r.services[0] : '-'),
        time: r.check_in ? (new Date(r.check_in)).toLocaleString() : '-',
        status: _normalizeStatus(r.status || '-'),
      });
    });
  } catch (err) {
    console.error('getRecentAppointments error', err);
    return [];
  }
}

/* ===== USERS ===== */
export async function getUsers() {
  try {
    const res = await request("/admin/users");
    const rows = Array.isArray(res) ? res : (res?.data || []);
    return rows.map((u) => ({
      id: u.user_id || u.id,
      name: u.full_name || u.fullName || `${u.first_name || ""} ${u.last_name || ""}`.trim(),
      email: u.email,
      phone: u.phone || "",
      pets: u.pets || [],
      role: u.role || 'customer',
      is_active: true, // Assume active for admin
      status: "Hoạt động",
    }));
  } catch (err) {
    console.error('getUsers error', err);
    return [];
  }
}

// Get current authenticated user's profile
export async function getProfile() {
  try {
    // Use standardized user route
    const res = await request("/user/profile");
    // request() already returns parsed JSON (or null), for consistency return the user object
    return res?.data || res;
  } catch (err) {
    throw err;
  }
}

// Update profile (name/email)
export async function updateProfile(payload) {
  try {
    const res = await request('/user/profile', { method: 'PUT', body: payload });
    return res || {};
  } catch (err) {
    throw err;
  }
}

// Change password
export async function changePassword(payload) {
  try {
    const res = await request('/user/change-password', { method: 'PUT', body: payload });
    return res || {};
  } catch (err) {
    throw err;
  }
}

/* ===== DOCTORS ===== */
export async function getDoctors() {
  try {
    const res = await request("/doctor", { auth: false });
    const rows = Array.isArray(res) ? res : res?.data || [];
    return rows.map((d) => ({
      id: d.doctor_id || d.id,
      name: d.doctor_name || d.name || "",
      specialty: d.specialty || "",
      experience: d.experience || "",
      status: d.status || "",
    }));
  } catch (err) {
    console.error('getDoctors error', err);
    return [];
  }
}

// Admin: fetch services via admin items blueprint (GET /admin/items/services)
export async function getAdminServices() {
  try {
    const res = await request('/admin/items/services', { auth: true });
    const rows = Array.isArray(res) ? res : res?.data || [];
    return rows.map((s) => ({
      id: s.service_id || s.id,
      name: s.service_name || s.name || s.title || "",
      price: s.price || s.unit_price || null,
    }));
  } catch (err) {
    console.error('getAdminServices error', err);
    return [];
  }
}

/* ===== FEEDBACKS ===== */
export const getReviews = async () => {
  try {
    // Use public feedback endpoint (no auth) for homepage testimonials
    const res = await request("/feedback/", { auth: false });
    const rows = res?.data || res || [];
    return rows.map((f) => ({
      id: f.feedback_id || f.id,
      name: f.name || f.user_name || `User #${f.user_id}`,
      pet: f.pet || f.pet_name || "",
      content: f.content || f.message || f.comment || "",
      rating: Number(f.rating) || 5,
    }));
  } catch (err) {
    console.error('getReviews error', err);
    return [];
  }
};

export const submitFeedback = async (data) => {
  try {
    // Attach Authorization header for authenticated feedback submissions
    const res = await request("/feedback/", { method: "POST", body: data, auth: true });
    return { success: true, message: res?.message || "OK", data: res?.data };
  } catch (err) {
    await delay();
    // Map common network/CORS failure messages to a clearer, localized message
    const raw = (err && err.message) ? err.message.toLowerCase() : '';
    if (raw.includes('cors') || raw.includes('network') || raw.includes('failed to fetch')) {
      return {
        success: false,
        message:
          'Lỗi kết nối: không thể liên lạc với máy chủ hoặc yêu cầu bị chặn bởi CORS. Vui lòng kiểm tra server đang chạy và FRONTEND_URL / PORT.'
      };
    }
    return { success: false, message: err.message };
  }
};

/* ===== FEEDBACK (USER) ===== */
export async function getMyFeedback() {
  try {
    const res = await request("/feedback/my");
    return res?.data || [];
  } catch (err) {
    return [];
  }
}

export async function hideFeedback(feedbackId) {
  try {
    const res = await request(`/feedback/${feedbackId}/hide`, { method: "PUT" });
    return res?.message || 'OK';
  } catch (err) {
    throw err;
  }
}

export async function showFeedback(feedbackId) {
  try {
    const res = await request(`/feedback/${feedbackId}/show`, { method: "PUT" });
    return res?.message || 'OK';
  } catch (err) {
    throw err;
  }
}

/* ===== AUTH ===== */
export async function login(email, password) {
  try {
    const res = await request("/auth/login", { method: "POST", body: { email, password }, auth: false });
    return res?.data || res;
  } catch (err) {
    throw err;
  }
}

export async function register(user) {
  try {
    const res = await request("/auth/register", { method: "POST", body: user, auth: false });
    return res?.data || res;
  } catch (err) {
    throw err;
  }
}

export async function logout() {
  try {
    const res = await request("/auth/logout", { method: "POST" });
    try { localStorage.removeItem('auth'); } catch (e) {}
    return res?.message || 'OK';
  } catch (err) {
    throw err;
  }
}

/* ===== APPOINTMENTS ===== */
export async function createAppointment(payload) {
  try {
    // Use standardized user-scoped endpoint
    const res = await request("/user/appointments", { method: "POST", body: payload });
    return res?.data || res;
  } catch (err) {
    throw err;
  }
}

export async function getMyAppointments() {
  try {
    // Use standardized user-scoped endpoint
    const res = await request("/user/appointments");
    const rows = res?.data || res;
    return rows;
  } catch (err) {
    console.error('getMyAppointments error', err);
    return [];
  }
}

export async function getAllAppointments() {
  try {
    const res = await request("/appointment/getall");
    return res?.data || [];
  } catch (err) {
    return [];
  }
}

export async function getAppointment(appointmentId) {
  try {
    const res = await request(`/appointment/${appointmentId}`);
    return res?.data || res;
  } catch (err) {
    throw err;
  }
}

export async function updateAppointment(appointmentId, payload) {
  try {
    const res = await request(`/appointment/${appointmentId}`, { method: "PUT", body: payload });
    return res?.data || res;
  } catch (err) {
    throw err;
  }
}

export async function deleteAppointment(appointmentId) {
  try {
    const res = await request(`/appointment/${appointmentId}`, { method: "DELETE" });
    return res?.message || 'OK';
  } catch (err) {
    throw err;
  }
}

/* ===== PETS ===== */
export async function createPet(payload) {
  try {
    // Use standardized user route
    const res = await request("/user/pets", { method: 'POST', body: payload });
    return res || {};
  } catch (err) {
    throw err;
  }
}

export async function getMyPets() {
  try {
    const res = await request("/user/pets");
    return res?.data || [];
  } catch (err) {
    return [];
  }
}

export async function getPet(petId) {
  try {
    const res = await request(`/admin/pets/${petId}`);
    const data = res?.data || res;
    if (!data || !data.pet) {
      return null;
    }
    return {
      name: data.pet.name,
      breed: data.pet.breed,
      age: data.pet.age,
      owner: {
        first_name: data.owner.full_name.split(' ')[0] || '',
        last_name: data.owner.full_name.split(' ')[1] || '',
        email: data.owner.email
      }
    };
  } catch (err) {
    console.error('getPet error', err);
    return null;
  }
}

export async function updatePet(petId, payload) {
  try {
    const res = await request(`/pets/${petId}`, { method: 'PUT', body: payload });
    return res?.data || res;
  } catch (err) {
    throw err;
  }
}

export async function deletePet(petId) {
  try {
    const res = await request(`/user/pets/${petId}`, { method: 'DELETE' });
    return res?.message || 'OK';
  } catch (err) {
    throw err;
  }
}

/* ===== MEDICAL ===== */
export async function createMedical(payload) {
  try {
    const res = await request("/medical", { method: 'POST', body: payload });
    return res?.data || res;
  } catch (err) {
    throw err;
  }
}

export async function getMedicalByPet(petId) {
  try {
    const res = await request(`/medical/pet/${petId}`);
    return res?.data || [];
  } catch (err) {
    return [];
  }
}

export async function getMedical(recordId) {
  try {
    const res = await request(`/medical/${recordId}`);
    return res?.data || res;
  } catch (err) {
    throw err;
  }
}

export async function updateMedical(recordId, payload) {
  try {
    const res = await request(`/medical/${recordId}`, { method: 'PUT', body: payload });
    return res?.data || res;
  } catch (err) {
    throw err;
  }
}

/* ===== ADMIN USER MANAGEMENT ===== */
export async function setUserRole(userId, role) {
  try {
    const res = await request(`/admin/users/${userId}/role`, { method: 'PUT', body: { role } });
    return res?.message || 'OK';
  } catch (err) {
    throw err;
  }
}

export async function lockUser(userId) {
  try {
    const res = await request(`/admin/users/${userId}/lock`, { method: 'PUT' });
    return res?.message || 'OK';
  } catch (err) {
    throw err;
  }
}

export async function unlockUser(userId) {
  try {
    const res = await request(`/admin/users/${userId}/unlock`, { method: 'PUT' });
    return res?.message || 'OK';
  } catch (err) {
    throw err;
  }
}

export async function deleteUser(userId) {
  try {
    const res = await request(`/admin/users/${userId}`, { method: 'DELETE' });
    return res?.message || 'OK';
  } catch (err) {
    throw err;
  }
}

/* ===== ACCOUNT ===== */
export async function getMe() {
  try {
    const res = await request("/user/me");
    return res?.data || res;
  } catch (err) {
    throw err;
  }
}

export async function updateMe(payload) {
  try {
    const res = await request("/user/me", { method: 'PUT', body: payload });
    return res?.data || res;
  } catch (err) {
    throw err;
  }
}

export async function changePasswordUser(payload) {
  try {
    const res = await request("/user/change-password", { method: 'PUT', body: payload });
    return res?.message || 'OK';
  } catch (err) {
    throw err;
  }
}

/* ===== VACCINATIONS ===== */
export async function createVaccination(payload) {
  try {
    const res = await request(`/vaccination/`, { method: 'POST', body: payload });
    return res?.data || res;
  } catch (err) {
    throw err;
  }
}

export async function getPetVaccinations(petId) {
  try {
    const res = await request(`/vaccination/pet/${petId}`);
    return res?.data || [];
  } catch (err) {
    return [];
  }
}

export async function updateVaccination(vaxId, payload) {
  try {
    const res = await request(`/vaccination/${vaxId}`, { method: 'PUT', body: payload });
    return res?.data || res;
  } catch (err) {
    throw err;
  }
}

function _normalizeStatus(raw) {
  if (!raw) return '-';
  const s = raw.toString().toLowerCase();
  if (s.includes('chờ')) return 'Đang chờ';
  // Map common appointment strings (confirmed/placed) to 'Đang chờ' for admin UI
  if (s.includes('thành công') || s.includes('đặt lịch') || s.includes('Đang chờ')) return 'Đang chờ xác nhận';
  if (s.includes('đang khám') || s.includes('in progress')) return 'Đang khám';
  if (s.includes('đã xong') || s.includes('hoàn thành') || s.includes('thành công')) return 'Đặt lịch hẹn thành công';
  if (s.includes('hủy')) return 'Đã hủy lịch hẹn';
  return raw;
}

function _formatVN(iso) {
  if (!iso) return null;
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

export async function getAdminAppointments() {
  try {
    const res = await request('/admin/appointments');
    const data = res?.data || [];
    if (data.length === 0) return [];
    return data.map(r => ({
      // Prefer slot_id as the unique visit id when available
      id: r.slot_id || r.appointment_id || null,
      appointment_id: r.appointment_id || null,
      slotId: r.slot_id || null,
      petName: r.pet_name || (r.pet && (r.pet.name || r.pet.pet_name)) || '-',
      ownerName: r.user_name || (r.user && `${r.user.first_name || ''} ${r.user.last_name || ''}`.trim()) || '-',
      // date/time fields: provide both ISO and VN-formatted display string
      date: r.booking_date || r.bookingDate || null,
      time: r.check_in ? _formatVN(r.check_in) : (r.timeslot || ''),
      checkIn: r.check_in ? _formatVN(r.check_in) : (r.check_in || null),
      checkInIso: r.check_in || null,
      checkOut: r.check_out ? _formatVN(r.check_out) : (r.check_out || null),
      checkOutIso: r.check_out || null,
      doctorName: r.doctor_name || (r.doctor && (r.doctor.doctor_name || r.doctor.name)) || '-',
      doctorId: r.doctor_id || (r.doctor && (r.doctor.doctor_id || r.doctor.id)) || null,
      // Backwards compatibility
      doctor: r.doctor_name || (r.doctor && (r.doctor.doctor_name || r.doctor.name)) || '-',
      service: r.service || '-',
      status: _normalizeStatus(r.status),
      user_id: r.user_id || null
    }));
  } catch (err) {
    console.error('getAdminAppointments error', err);
    return [];
  }
}

export async function getAppointmentsStats() {
  try {
    const res = await request('/admin/appointments/stats');
    return res?.data || {};
  } catch (err) {
    console.error('getAppointmentsStats error', err);
    return {};
  }
}

export async function getAdminDoctors() {
  try {
    const res = await request('/admin/doctors');
    const rows = res?.data || [];
    return rows.map(d => ({
      id: d.doctor_id || d.id,
      name: d.doctor_name || d.name || '',
      email: d.email || '',
      specialty: d.specialty || '',
      phone: d.phone || '',
      // Ensure schedule exists to avoid .map() on undefined
      schedule: Array.isArray(d.schedule) ? d.schedule : (d.schedule ? [d.schedule] : []),
      monthlySchedule: d.monthlySchedule || {},
      current_status: d.current_status || d.status || 'NONE'
    }));
  } catch (err) {
    console.error('getAdminDoctors error', err);
    return [];
  }
}

export async function createDoctor(payload) {
  try {
    const res = await request('/admin/doctors', { method: 'POST', body: payload });
    return res?.data || res;
  } catch (err) {
    throw err;
  }
}

export async function deleteDoctor(doctorId) {
  try {
    const res = await request(`/admin/doctors/${doctorId}`, { method: 'DELETE' });
    return res?.message || 'OK';
  } catch (err) {
    throw err;
  }
}

export async function getDoctorsSchedule() {
  try {
    const res = await request('/admin/doctors/schedule');
    return res?.data || [];
  } catch (err) {
    console.error('getDoctorsSchedule error', err);
    return [];
  }
}

export async function getFeedbackStats() {
  try {
    const res = await request('/admin/feedback/stats', { auth: true });
    return res?.data || {};
  } catch (err) {
    console.error('getFeedbackStats error', err);
    return {};
  }
}

export async function getFeedbackList() {
  try {
    const res = await request('/admin/feedback', { auth: true });
    return res?.data || [];
  } catch (err) {
    console.error('getFeedbackList error', err);
    return [];
  }
}

export async function updateFeedbackStatus(feedbackId, status) {
  try {
    const res = await request(`/admin/feedback/${feedbackId}/status`, { method: 'PATCH', body: { status }, auth: true });
    return res?.message || 'OK';
  } catch (err) {
    throw err;
  }
}

export async function getInvoicesStats() {
  try {
    const res = await request('/admin/invoices/stats');
    return res?.data || {};
  } catch (err) {
    console.error('getInvoicesStats error', err);
    return {};
  }
}

export async function getInvoicesList(params) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await request(`/admin/invoices?${query}`);
    return res?.data || [];
  } catch (err) {
    console.error('getInvoicesList error', err);
    return [];
  }
}

export async function getInvoiceDetails(invoiceId) {
  try {
    const res = await request(`/admin/invoices/details/${invoiceId}`);
    return res?.data || {};
  } catch (err) {
    console.error('getInvoiceDetails error', err);
    return {};
  }
}

export async function downloadInvoicePDF(invoiceId) {
  try {
    const res = await fetch(`${BASE}/admin/invoices/download_pdf/${invoiceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')).accessToken : ''}`,
      },
    });

    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${invoiceId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return true;
  } catch (err) {
    console.error('downloadInvoicePDF error', err);
    throw err;
  }
}

export async function getPetStats() {
  try {
    const res = await request('/admin/pets/stats');
    return res?.data || {};
  } catch (err) {
    console.error('getPetStats error', err);
    return {};
  }
}

export async function getSlotsStats() {
  try {
    const res = await request('/admin/slots/stats');
    return res?.data || {};
  } catch (err) {
    console.error('getSlotsStats error', err);
    return {};
  }
}

export async function updateSlotCheckout(slotId, payload) {
  try {
    // Use the dedicated checkout endpoint
    const res = await request(`/admin/slots/${slotId}/checkout`, { method: 'PATCH', body: payload });
    return res?.data || res;
  } catch (err) {
    throw err;
  }
}

// export async function updateSlotStatus(slotId, status) {
//   try {
//     const res = await request(`/admin/slots/${slotId}/status`, { method: 'PUT', body: { status } });
//     return res?.data || res;
//   } catch (err) {
//     throw err;
//   }
// }


export async function updateSlotStatus(slotId, status) {
  if (!slotId) {
    throw new Error('slotId is required to update slot status');
  }

  const res = await request(`/admin/slots/${slotId}/status`, { method: 'PUT', body: { status } });

  return res?.data || res;
}


export async function getUserPets(userId) {
  try {
    const res = await request(`/admin/users/${userId}/pets`);
    return res?.data || [];
  } catch (err) {
    console.error('getUserPets error', err);
    return [];
  }
}

export async function createPatientReport(slotId, payload) {
  try {
    const res = await request(`/admin/slots/${slotId}/report`, { method: 'POST', body: payload });
    return res?.data || res;
  } catch (err) {
    throw err;
  }
}

export async function getSlotsList(params) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await request(`/admin/slots?${query}`);
    return res?.data || [];
  } catch (err) {
    console.error('getSlotsList error', err);
    return [];
  }
}

export async function searchUsers(query) {
  try {
    const res = await request(`/admin/users/search?q=${encodeURIComponent(query)}`);
    return res?.data || [];
  } catch (err) {
    console.error('searchUsers error', err);
    return [];
  }
}

export async function getAdminPets() {
  try {
    const res = await request('/admin/pets');
    const data = res?.data || [];
    if (data.length === 0) return [];
    return data.map(p => ({
      id: p.pet_id || p.id,
      pet_id: p.pet_id || p.id,
      name: p.name || '',
      breed: p.breed || '',
      age: p.age ?? null,
      // Return owner as a simple string to match UI expectations
      owner: p.owner_name || (p.owner && (p.owner.full_name || `${p.owner.first_name || ''} ${p.owner.last_name || ''}`)) || '',
      species: p.species || 'Unknown',
      gender: p.gender || '',
      status: p.status || 'Unknown',
      lastVisit: p.last_visit || p.lastVisit || null
    }));
  } catch (err) {
    console.error('getAdminPets error', err);
    return [];
  }
}

// Compatibility `api` object used by some admin pages and legacy imports
export const api = {
  getVisits: async () => {
    try {
      const rows = await request('/admin/appointments', { auth: true });
      const data = rows?.data || [];
      if (data.length === 0) return [];
      return data.map(r => ({
        date: r.booking_date,
        petName: r.pet_name,
        ownerName: r.user_name,
        doctorName: r.doctor_name,
        status: r.status,
        service: 'General'
      }));
    } catch (err) {
      console.error('api.getVisits error', err);
      return [];
    }
  },

  getServices: async () => {
    try {
      const res = await request('/admin/items/services');
      const data = res?.data || [];
      if (data.length === 0) return [];
      // Ensure price is numeric and provide defaults
      return data.map(s => ({
        id: s.service_id,
        name: s.name,
        price: Number(s.price) || 0,
        category: s.service_category || 'General',
        duration: s.duration || '-'
      }));
    } catch (err) {
      console.error('api.getServices error', err);
      return [];
    }
  },

  // Backwards-compatible accessors for admin pages
  getAdminServices: async () => {
    try {
      return await getAdminServices();
    } catch (err) {
      console.error('api.getAdminServices error', err);
      return [];
    }
  },

  getAdminDoctors: async () => {
    try {
      return await getAdminDoctors();
    } catch (err) {
      console.error('api.getAdminDoctors error', err);
      return [];
    }
  },

  getMedications: async () => {
    try {
      const res = await request('/admin/items/medicines');
      const data = res?.data || [];
      if (data.length === 0) return [];
      return data.map(m => {
        const price = (m.price === null || m.price === undefined) ? 0 : Number(m.price);
        return {
          id: m.medicine_id,
          name: m.name,
          // expose pricePerUnit for UI compatibility
          pricePerUnit: Number.isFinite(price) ? price : 0,
          quantity: m.quantity || 0,
          unit: m.unit || 'dose',
          expiryDate: m.expiry_date || null,
          nextOrder: m.next_order || null,
          type: m.type || (/(vac|vaccine|vacxin)/i.test(m.name || '') ? 'Vaccine' : 'Medication')
        };
      });
    } catch (err) {
      console.error('api.getMedications error', err);
      return [];
    }
  },

  getInvoices: async () => {
    try {
      const res = await request('/admin/invoices');
      const data = res?.data || [];
      if (data.length === 0) return [];
      return data.map(inv => ({
        invoiceId: inv.invoice_id,
        amount: inv.total,
        status: 'Paid',
        patientName: inv.pet_name,
        ownerName: inv.user_name,
        dueDate: inv.check_out,
        subtotal: inv.total,
        tax: 0,
        services: [],
        medications: []
      }));
    } catch (err) {
      console.error('api.getInvoices error', err);
      return [];
    }
  },

  getHotelBookings: async () => {
    try {
      const res = await request('/admin/hotel/registrations');
      const data = res?.data || [];
      if (data.length === 0) return [];
      return data.map(b => ({
        petName: b.pet_name,
        ownerName: b.user_name,
        checkIn: b.check_in,
        checkOut: b.check_out,
        pethouse: b.pethouse,
        days: b.days,
        total: b.total
      }));
    } catch (err) {
      console.error('api.getHotelBookings error', err);
      return [];
    }
  },

  getHotelRooms: async () => {
    try {
      const res = await request('/admin/pet-hotel/houses');
      return (res?.data || []).map(r => ({
        number: r.name,
        status: 'Available'
      }));
    } catch (err) {
      console.error('api.getHotelRooms error', err);
      return [];
    }
  },

  getMedicalRecords: async () => {
    try {
      const res = await request('/admin/patient_reports/summary');
      const data = res?.data || [];
      return data.map(r => ({
        reportId: r.report_id,
        petName: r.pet_name,
        ownerName: r.user_name,
        doctorName: r.doctor_name,
        status: _normalizeStatus(r.status),
        // Add other fields if available, else defaults
        serviceType: r.serviceType || 'Medical Service',
        reportDate: r.check_in ? new Date(r.check_in).toLocaleDateString() : '',
        reportTime: r.check_in ? new Date(r.check_in).toLocaleTimeString() : '',
        petSpecies: r.petSpecies || '',
        petBreed: r.petBreed || '',
        petAge: r.petAge || '',
        ownerId: r.ownerId || '',
        petId: r.petId || ''
      }));
    } catch (err) {
      console.error('api.getMedicalRecords error', err);
      return [];
    }
  },

  getReportsStats: async () => {
    try {
      const res = await request('/admin/patient_reports/stats');
      const data = res?.data || {};
      return {
        totalReports: data.totalReports || 0,
        finishedReports: data.finishedReports || 0,
      };
    } catch (err) {
      console.error('api.getReportsStats error', err);
      return { totalReports: 0, finishedReports: 0 };
    }
  },

  getMedicalRecordByReportId: async (reportId) => {
    try {
      const res = await request(`/admin/patient_reports/detail/${reportId}`);
      const data = res?.data || null;
      if (!data) return null;

      // Assuming the structure matches what the UI expects
      return {
        reportId: data.reportId || data.report_id,
        serviceType: data.serviceType || data.services?.[0] || 'Medical Service',
        reportDate: data.reportDate || data.check_in,
        reportTime: data.reportTime || (data.check_in ? new Date(data.check_in).toLocaleTimeString() : ''),
        petId: data.petId || data.pet?.pet_id,
        petName: data.petName || data.pet?.name,
        petSpecies: data.petSpecies || data.pet?.species,
        petBreed: data.petBreed || data.pet?.breed,
        petAge: data.petAge || data.pet?.age,
        ownerId: data.ownerId || data.user?.user_id,
        ownerName: data.ownerName || data.user?.user_name || `${data.user?.first_name || ''} ${data.user?.last_name || ''}`.trim(),
        doctorName: data.doctorName || data.doctor_name,
        symptoms: data.symptoms,
        treatmentDetails: data.treatmentDetails || data.services || [],
        medicalHistory: data.medicalHistory || data.medicines?.map(m => m.name) || [],
        dosage: data.dosage,
        frequency: data.frequency,
        medicalCondition: data.medicalCondition,
        images: data.images || [],
        status: _normalizeStatus(data.status)
      };
    } catch (err) {
      console.error('api.getMedicalRecordByReportId error', err);
      return null;
    }
  },

  downloadReportJson: async (reportId) => {
    try {
      const res = await fetch(`${BASE}/admin/patient_reports/download_report/${reportId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')).accessToken : ''}`,
        },
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${reportId}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('api.downloadReportJson error', err);
      throw err;
    }
  },

  downloadReportPdf: async (reportId) => {
    try {
      const res = await fetch(`${BASE}/admin/patient_reports/download_pdf/${reportId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')).accessToken : ''}`,
        },
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('api.downloadReportPdf error', err);
      throw err;
    }
  },
};

// Named helper exports matching requested names (use real backend routes)
export async function getStats() {
  try {
    const res = await request('/admin/statistics', { auth: true });
    return res?.data || {};
  } catch (err) {
    console.error('getStats error', err);
    return {};
  }
}

export async function getTodayAppointments() {
  try {
    const res = await request('/admin/appointments', { auth: true });
    return res?.data || {};
  } catch (err) {
    console.error('getTodayAppointments error', err);
    return {};
  }
}

export async function getReportsStats() {
  try {
    const res = await request('/admin/reports/summary', { auth: true });
    const data = res?.data || {};
    return {
      totalReports: data.stats?.totalReports || 0,
      finishedReports: data.stats?.finishedReports || 0,
    };
  } catch (err) {
    console.error('getReportsStats error', err);
    return { totalReports: 0, finishedReports: 0 };
  }
}

export async function getAppointments(params) {
  try {
    const q = params ? `?${new URLSearchParams(params).toString()}` : '';
    const res = await request(`/admin/appointments${q}`, { auth: true });
    return res?.data || [];
  } catch (err) {
    console.error('getAppointments error', err);
    return [];
  }
}

export async function getQuickStats() {
  // Alias to getStats - returns the dashboard summary
  return getStats();
}

export async function addDoctor(payload) {
  return await createDoctor(payload);
}

export async function addUser(payload) {
  try {
    const res = await request('/admin/users', { method: 'POST', body: payload });
    return res?.data || res;
  } catch (err) {
    throw err;
  }
}

export async function getPets() {
  return await getAdminPets();
}

export async function getPetById(petId) {
  try {
    const res = await request(`/admin/pets/${petId}`, { auth: true });
    return res?.data || null;
  } catch (err) {
    console.error('getPetById error', err);
    return null;
  }
}

// Fetch detailed pet payload and normalize to a UI-friendly shape
export async function getPetDetail(petId) {
  try {
    const res = await request(`/admin/pets/${petId}`, { auth: true });
    const payload = res?.data || res || null;
    if (!payload) return null;

    const pet = payload.pet || {};
    const owner = payload.owner || {};
    const lastVisit = payload.lastVisit || {};

    return {
      name: pet.name || '',
      breed: pet.breed || '',
      age: pet.age || '',
      owner: owner.full_name || '',
      ownerContact: owner.email || '',
      assignedDoctor: lastVisit.doctorName || '',
      lastVisit: lastVisit.time || null,
    };
  } catch (err) {
    console.error('getPetDetail error', err);
    return null;
  }
}

export async function getServicesList() {
  try {
    const res = await request('/admin/items/services', { auth: true });
    return res?.data || [];
  } catch (err) {
    console.error('getServicesList error', err);
    return [];
  }
}

export async function getMedicationsList() {
  try {
    const res = await request('/admin/items/medicines', { auth: true });
    return res?.data || [];
  } catch (err) {
    console.error('getMedicationsList error', err);
    return [];
  }
}

export async function getVisits() {
  try {
    const res = await request('/admin/appointments', { auth: true });
    return res?.data || [];
  } catch (err) {
    console.error('getVisits error', err);
    return [];
  }
}

export async function getMedicalRecords() {
  try {
    const res = await request('/admin/patient_reports/summary', { auth: true });
    const data = res?.data || [];
    return data.map(r => ({
      reportId: r.report_id,
      petName: r.pet_name,
      ownerName: r.user_name,
      doctorName: r.doctor_name,
      status: _normalizeStatus(r.status),
      // Add other fields if available, else defaults
      serviceType: r.serviceType || 'Medical Service',
      reportDate: r.check_in ? new Date(r.check_in).toLocaleDateString() : '',
      reportTime: r.check_in ? new Date(r.check_in).toLocaleTimeString() : '',
      petSpecies: r.petSpecies || '',
      petBreed: r.petBreed || '',
      petAge: r.petAge || '',
      ownerId: r.ownerId || '',
      petId: r.petId || ''
    }));
  } catch (err) {
    console.error('getMedicalRecords error', err);
    return [];
  }
}

export async function getMedicalRecordByReportId(reportId) {
  try {
    const res = await request(`/admin/patient_reports/detail/${reportId}`, { auth: true });
    const data = res?.data || null;
    if (!data) return null;

    // Assuming the structure matches what the UI expects
    return {
      reportId: data.reportId || data.report_id,
      serviceType: data.serviceType || data.services?.[0] || 'Medical Service',
      reportDate: data.reportDate || data.check_in,
      reportTime: data.reportTime || (data.check_in ? new Date(data.check_in).toLocaleTimeString() : ''),
      petId: data.petId || data.pet?.pet_id,
      petName: data.petName || data.pet?.name,
      petSpecies: data.petSpecies || data.pet?.species,
      petBreed: data.petBreed || data.pet?.breed,
      petAge: data.petAge || data.pet?.age,
      ownerId: data.ownerId || data.user?.user_id,
      ownerName: data.ownerName || data.user?.user_name || `${data.user?.first_name || ''} ${data.user?.last_name || ''}`.trim(),
      doctorName: data.doctorName || data.doctor_name,
      symptoms: data.symptoms || data.symptoms_list || [],
      // treatmentDetails may be an array of service names or objects
      treatmentDetails: data.treatmentDetails || data.services || [],
      // Keep medicines as objects with quantity when provided by backend
      medicalHistory: data.medicalHistory || data.medicines || (data.medicines_list ? data.medicines_list : []),
      dosage: data.dosage,
      frequency: data.frequency,
      medicalCondition: data.medicalCondition,
      images: data.images || [],
      status: _normalizeStatus(data.status)
    };
  } catch (err) {
    console.error('getMedicalRecordByReportId (named) error', err);
    return null;
  }
}

export async function getInvoices() {
  try {
    const res = await request('/admin/invoices', { auth: true });
    return res?.data || [];
  } catch (err) {
    console.error('getInvoices error', err);
    return [];
  }
}

export async function getInvoiceById(invoiceId) {
  try {
    const res = await request(`/admin/invoices/details/${invoiceId}`, { auth: true });
    return res?.data || null;
  } catch (err) {
    console.error('getInvoiceById error', err);
    return null;
  }
}

export async function getHotelBookings() {
  try {
    const res = await request('/admin/pet-hotel/registrations', { auth: true });
    return res?.data || [];
  } catch (err) {
    console.error('getHotelBookings error', err);
    return [];
  }
}

export async function getHotelRooms() {
  try {
    const res = await request('/admin/pet-hotel/houses', { auth: true });
    return res?.data || [];
  } catch (err) {
    console.error('getHotelRooms error', err);
    return [];
  }
}

export async function getFeedback() {
  try {
    const res = await request('/admin/feedback', { auth: true });
    return res?.data || [];
  } catch (err) {
    console.error('getFeedback error', err);
    return [];
  }
}

export async function downloadReportJson(reportId) {
  try {
    const res = await fetch(`${BASE}/admin/patient_reports/download_report/${reportId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')).accessToken : ''}`,
      },
    });
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${reportId}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (err) {
    console.error('downloadReportJson error', err);
    throw err;
  }
}

export async function downloadReportPdf(reportId) {
  try {
    const res = await fetch(`${BASE}/admin/patient_reports/download_pdf/${reportId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')).accessToken : ''}`,
      },
    });
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${reportId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (err) {
    console.error('downloadReportPdf error', err);
    throw err;
  }
}

// Also provide default export for compatibility
export default api;
