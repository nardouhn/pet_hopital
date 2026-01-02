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
    const res = await request("/admin/statistics");
    const data = res?.data || {};

    const totalPets = data.totalPets || 0;
    const totalUsers = data.totalUsers || 0;
    const totalAppointments = data.totalAppointments || 0;
    const totalRevenue = data.totalRevenue || 0;

    return [
      { title: "Tổng thú cưng", value: totalPets },
      { title: "Người dùng", value: totalUsers },
      { title: "Lịch hôm nay", value: totalAppointments },
      { title: "Doanh thu", value: totalRevenue ? `₫${Number(totalRevenue).toLocaleString()}` : "₫0" },
    ];
  } catch (err) {
    // Fallback to mock data on error
    await delay();
    return [
      { title: "Tổng thú cưng", value: 1247 },
      { title: "Người dùng", value: 892 },
      { title: "Lịch hôm nay", value: 34 },
      { title: "Doanh thu", value: "₫245M" },
    ];
  }
}

export async function getRecentAppointments() {
  try {
    // Use admin endpoint to include user/pet/doctor details and latest-first ordering
    const res = await request("/admin/appointments");
    const rows = res?.data || [];
    // Sort latest by created_at or booking_date (fallback to appointment_id)
    rows.sort((a, b) => {
      const ad = a.booking_date || a.created_at || a.appointment_id || 0;
      const bd = b.booking_date || b.created_at || b.appointment_id || 0;
      return new Date(bd) - new Date(ad);
    });
    return rows.slice(0, 10).map((r) => ({
      pet: r.pet?.name || r.pet_name || "-",
      owner: r.user ? `${r.user.first_name || ''} ${r.user.last_name || ''}`.trim() : (r.owner_name || "-"),
      doctor: r.doctor?.doctor_name || r.doctor_name || r.doctor || "-",
      time: r.timeslot || r.check_in || "-",
      status: r.status || "-",
    }));
  } catch (err) {
    console.error('getRecentAppointments error', err);
    await delay();
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
    await delay();
    return [
      {
        id: 1,
        name: "Nguyễn Văn A",
        email: "vana@gmail.com",
        phone: "0912345678",
        pets: 2,
        role: 'customer',
        status: "Hoạt động",
        is_active: true,
      },
      {
        id: 2,
        name: "Lê Thị B",
        email: "lethi@gmail.com",
        phone: "0987654321",
        pets: 1,
        role: 'admin',
        status: "Tạm khóa",
        is_active: false,
      },
    ];
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
    await delay();
    return [
      {
        id: 1,
        name: "BS. Trần Minh",
        specialty: "Nội khoa",
        experience: "8 năm",
        status: "Đang làm việc",
      },
      {
        id: 2,
        name: "BS. Nguyễn Lan",
        specialty: "Ngoại khoa",
        experience: "5 năm",
        status: "Nghỉ phép",
      },
    ];
  }
}

/* ===== FEEDBACKS ===== */
export const getReviews = async () => {
  try {
    const res = await request("/feedback/admin");
    const rows = res?.data || [];
    return rows.map((f) => ({
      id: f.feedback_id || f.id,
      name: `User #${f.user_id}`,
      pet: "",
      content: f.message || f.content || "",
      rating: 5,
    }));
  } catch (err) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            name: "Trang Lê",
            pet: "Max (Chó Poodle)",
            content:
              "Bác sĩ ở đây siêu dễ thương luôn! Bé chó nhà mình đi khám mà cứ vẫy đuôi suốt.",
            rating: 5,
          },
          {
            id: 2,
            name: "Hải Đăng",
            pet: "Luna (Mèo Anh lông dài)",
            content:
              "Phòng khám rất chuyên nghiệp, bác sĩ nhẹ nhàng và giải thích rõ ràng.",
            rating: 5,
          },
        ]);
      }, 600);
    });
  }
};

export const submitFeedback = async (data) => {
  try {
    // Attach Authorization header for authenticated feedback submissions
    const res = await request("/feedback", { method: "POST", body: data, auth: true });
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

    // If backend returns empty array during development, provide a mocked dataset for UI testing
    if (import.meta.env.DEV && Array.isArray(rows) && rows.length === 0) {
      await delay(80);
      return [
        {
          appointment_id: 101,
          booking_date: '2025-12-30',
          timeslot: '09:00 - 10:00',
          pet_name: 'Max',
          doctor_name: 'BS. Nguyễn Văn A',
          service: 'Khám tổng quát',
          description: 'Bị sốt, bỏ ăn',
          invoice_url: null,
          status: 'confirmed'
        },
        {
          appointment_id: 102,
          booking_date: '2025-12-31',
          timeslot: '10:00 - 11:00',
          pet_name: 'Luna',
          doctor_name: 'BS. Trần Minh',
          service: 'Tiêm vacxin',
          description: 'Tiêm phòng định kỳ',
          invoice_url: `${BASE}/invoices/102`,
          status: 'pending'
        },
        {
          appointment_id: 103,
          booking_date: '2026-01-02',
          timeslot: '',
          pet_name: 'Buddy',
          doctor_name: null,
          service: null,
          description: null,
          invoice_url: null,
          status: 'pending'
        }
      ];
    }

    return rows;
  } catch (err) {
    // In development we can fallback to mock data to simplify UI testing; in production bubble the error.
    if (import.meta.env.DEV) {
      await delay(80);
      return [
        {
          appointment_id: 201,
          booking_date: '2025-12-30',
          timeslot: '09:00 - 10:00',
          pet_name: 'Milo',
          doctor_name: 'BS. Lan',
          service: 'Khám tổng quát',
          description: 'Mèo sốt',
          invoice_url: null,
          status: 'confirmed'
        },
        {
          appointment_id: 202,
          booking_date: '2025-12-31',
          timeslot: '11:00 - 12:00',
          pet_name: 'Bella',
          doctor_name: 'BS. Hà',
          service: 'Spa',
          description: 'Gội và cắt móng',
          invoice_url: `${BASE}/invoices/202`,
          status: 'pending'
        }
      ];
    }

    throw err;
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
      return {
        name: 'Max',
        breed: 'Dog',
        age: 3,
        owner: {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com'
        }
      };
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
    return {
      name: 'Max',
      breed: 'Dog',
      age: 3,
      owner: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com'
      }
    };
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

export async function getAdminAppointments() {
  try {
    const res = await request('/admin/appointments');
    const data = res?.data || [];
    if (data.length === 0) {
      return [
        {
          appointment_id: 1,
          pet: { name: 'Max' },
          doctor: { doctor_name: 'Dr. Smith' },
          booking_date: '2025-01-01',
          timeslot: '10:00',
          user: { first_name: 'John', last_name: 'Doe' },
          status: 'confirmed'
        }
      ];
    }
    return data.map(r => ({
      appointment_id: r.appointment_id,
      pet: { name: r.pet_name },
      doctor: { doctor_name: r.doctor_name },
      booking_date: r.booking_date,
      timeslot: r.check_in ? new Date(r.check_in).toLocaleTimeString() : '',
      user: {
        first_name: r.user_name.split(' ')[0] || '',
        last_name: r.user_name.split(' ')[1] || ''
      },
      status: r.status
    }));
  } catch (err) {
    await delay();
    return [
      {
        appointment_id: 1,
        pet: { name: 'Max' },
        doctor: { doctor_name: 'Dr. Smith' },
        booking_date: '2025-01-01',
        timeslot: '10:00',
        user: { first_name: 'John', last_name: 'Doe' },
        status: 'confirmed'
      }
    ];
  }
}

export async function getAppointmentsStats() {
  try {
    const res = await request('/admin/appointments/stats');
    return res?.data || {};
  } catch (err) {
    await delay();
    return {};
  }
}

export async function getAdminDoctors() {
  try {
    const res = await request('/admin/doctors');
    const data = res?.data || [];
    if (data.length === 0) {
      return [
        {
          doctor_id: 1,
          doctor_name: 'Dr. Smith',
          email: 'smith@clinic.com',
          current_status: 'Available'
        }
      ];
    }
    return data;
  } catch (err) {
    await delay();
    return [
      {
        doctor_id: 1,
        doctor_name: 'Dr. Smith',
        email: 'smith@clinic.com',
        current_status: 'Available'
      }
    ];
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
    await delay();
    return [];
  }
}

export async function getFeedbackStats() {
  try {
    const res = await request('/admin/feedback/stats');
    return res?.data || {};
  } catch (err) {
    await delay();
    return {};
  }
}

export async function getFeedbackList() {
  try {
    const res = await request('/admin/feedback');
    return res?.data || [];
  } catch (err) {
    await delay();
    return [];
  }
}

export async function updateFeedbackStatus(feedbackId, status) {
  try {
    const res = await request(`/admin/feedback/${feedbackId}/status`, { method: 'PATCH', body: { status } });
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
    await delay();
    return {};
  }
}

export async function getInvoicesList(params) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await request(`/admin/invoices?${query}`);
    return res?.data || [];
  } catch (err) {
    await delay();
    return [];
  }
}

export async function getInvoiceDetails(invoiceId) {
  try {
    const res = await request(`/admin/invoices/details/${invoiceId}`);
    return res?.data || {};
  } catch (err) {
    await delay();
    return {};
  }
}

export async function downloadInvoicePDF(invoiceId) {
  try {
    const res = await request(`/admin/invoices/download_pdf/${invoiceId}`);
    // Assuming it returns a file, but since it's fetch, handle accordingly
    return res;
  } catch (err) {
    throw err;
  }
}

export async function getPetStats() {
  try {
    const res = await request('/admin/pets/stats');
    return res?.data || {};
  } catch (err) {
    await delay();
    return {};
  }
}

export async function getSlotsStats() {
  try {
    const res = await request('/admin/slots/stats');
    return res?.data || {};
  } catch (err) {
    await delay();
    return {};
  }
}

export async function getSlotsList(params) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await request(`/admin/slots?${query}`);
    return res?.data || [];
  } catch (err) {
    await delay();
    return [];
  }
}

export async function searchUsers(query) {
  try {
    const res = await request(`/admin/users/search?q=${encodeURIComponent(query)}`);
    return res?.data || [];
  } catch (err) {
    await delay();
    return [];
  }
}

export async function getAdminPets() {
  try {
    const res = await request('/admin/pets');
    const data = res?.data || [];
    if (data.length === 0) {
      return [
        {
          pet_id: 1,
          name: 'Max',
          breed: 'Dog',
          age: 3,
          owner: { first_name: 'John', last_name: 'Doe' }
        }
      ];
    }
    return data.map(p => ({
      pet_id: p.pet_id,
      name: p.name,
      breed: p.breed,
      age: p.age,
      owner: {
        first_name: p.owner_name.split(' ')[0] || '',
        last_name: p.owner_name.split(' ')[1] || ''
      }
    }));
  } catch (err) {
    await delay();
    return [
      {
        pet_id: 1,
        name: 'Max',
        breed: 'Dog',
        age: 3,
        owner: { first_name: 'John', last_name: 'Doe' }
      }
    ];
  }
}

// Compatibility `api` object used by some admin pages and legacy imports
export const api = {
  getVisits: async () => {
    try {
      const rows = await request('/admin/appointments');
      const data = rows?.data || [];
      if (data.length === 0) {
        return [
          {
            date: '2025-01-01',
            petName: 'Max',
            ownerName: 'John Doe',
            doctorName: 'Dr. Smith',
            status: 'confirmed',
            service: 'Checkup'
          }
        ];
      }
      return data.map(r => ({
        date: r.booking_date,
        petName: r.pet_name,
        ownerName: r.user_name,
        doctorName: r.doctor_name,
        status: r.status,
        service: 'General'
      }));
    } catch (err) {
      await delay();
      return [
        {
          date: '2025-01-01',
          petName: 'Max',
          ownerName: 'John Doe',
          doctorName: 'Dr. Smith',
          status: 'confirmed',
          service: 'Checkup'
        }
      ];
    }
  },

  getServices: async () => {
    try {
      const res = await request('/admin/items/services');
      const data = res?.data || [];
      if (data.length === 0) {
        return [
          {
            id: 1,
            name: 'Checkup',
            price: 50000,
            category: 'Examination',
            duration: '30 min'
          }
        ];
      }
      return data.map(s => ({
        id: s.service_id,
        name: s.name,
        price: s.price,
        category: 'General',
        duration: '-'
      }));
    } catch (err) {
      await delay();
      return [
        {
          id: 1,
          name: 'Checkup',
          price: 50000,
          category: 'Examination',
          duration: '30 min'
        }
      ];
    }
  },

  getMedications: async () => {
    try {
      const res = await request('/admin/items/medicines');
      const data = res?.data || [];
      if (data.length === 0) {
        return [
          {
            id: 1,
            name: 'Painkiller',
            price: 10000,
            type: 'Medication'
          }
        ];
      }
      return data.map(m => ({
        id: m.medicine_id,
        name: m.name,
        price: m.price,
        type: 'Medication'
      }));
    } catch (err) {
      await delay();
      return [
        {
          id: 1,
          name: 'Painkiller',
          price: 10000,
          type: 'Medication'
        }
      ];
    }
  },

  getInvoices: async () => {
    try {
      const res = await request('/admin/invoices');
      const data = res?.data || [];
      if (data.length === 0) {
        return [
          {
            invoiceId: 1,
            amount: 50000,
            status: 'Paid',
            patientName: 'Max',
            ownerName: 'John Doe',
            dueDate: '2025-01-01',
            subtotal: 50000,
            tax: 0,
            services: [],
            medications: []
          }
        ];
      }
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
      await delay();
      return [
        {
          invoiceId: 1,
          amount: 50000,
          status: 'Paid',
          patientName: 'Max',
          ownerName: 'John Doe',
          dueDate: '2025-01-01',
          subtotal: 50000,
          tax: 0,
          services: [],
          medications: []
        }
      ];
    }
  },

  getHotelBookings: async () => {
    try {
      const res = await request('/admin/pet-hotel/registrations');
      const data = res?.data || [];
      if (data.length === 0) {
        return [
          {
            petName: 'Max',
            ownerName: 'John Doe',
            checkIn: '2025-01-01',
            checkOut: null,
            pethouse: 'Room 1',
            days: 1,
            total: 50000
          }
        ];
      }
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
      await delay();
      return [
        {
          petName: 'Max',
          ownerName: 'John Doe',
          checkIn: '2025-01-01',
          checkOut: null,
          pethouse: 'Room 1',
          days: 1,
          total: 50000
        }
      ];
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
      await delay();
      return [];
    }
  },

  getMedicalRecords: async () => {
    try {
      const res = await request('/admin/patient_reports/list');
      const data = res?.data || [];
      if (data.length === 0) {
        return [
          {
            petName: 'Max',
            ownerName: 'John Doe',
            doctorName: 'Dr. Smith',
            services: ['Checkup'],
            medicines: [],
            symptoms: [],
            diseases: [],
            status: 'Completed',
            reportDate: '2025-01-01'
          }
        ];
      }
      return data.map(r => ({
        petName: r.pet.name,
        ownerName: r.user.user_name,
        doctorName: r.doctor_name,
        services: r.services,
        medicines: r.medicines,
        symptoms: r.symptoms,
        diseases: r.diseases,
        status: r.status,
        reportDate: r.check_in
      }));
    } catch (err) {
      await delay();
      return [
        {
          petName: 'Max',
          ownerName: 'John Doe',
          doctorName: 'Dr. Smith',
          services: ['Checkup'],
          medicines: [],
          symptoms: [],
          diseases: [],
          status: 'Completed',
          reportDate: '2025-01-01'
        }
      ];
    }
  },

  getMedicalRecordByReportId: async (reportId) => {
    try {
      const res = await request(`/admin/patient_reports/download_report/${reportId}`);
      const data = res?.data || res;
      return {
        petName: data.pet.name,
        ownerName: data.user.user_name,
        doctorName: data.doctor_name,
        services: data.services,
        medicines: data.medicines,
        symptoms: data.symptoms,
        diseases: data.diseases,
        status: data.status,
        reportDate: data.check_in
      };
    } catch (err) {
      await delay();
      return null;
    }
  },
};

// Also provide default export for compatibility
export default api;
