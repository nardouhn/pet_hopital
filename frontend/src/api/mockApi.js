const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

// Use a relative base by default in development so Vite's dev server can proxy API requests
// when running inside Docker. Production builds can set VITE_API_BASE to an absolute URL.
const BASE = import.meta.env.VITE_API_BASE ?? "";

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
    const [apptsRes, revRes, patientsRes, servicesRes] = await Promise.all([
      request("/admin/statistics/appointments"),
      request("/admin/statistics/revenue"),
      request("/admin/statistics/patients"),
      request("/admin/statistics/services"),
    ]);

    const totalAppointments = apptsRes?.data?.total ?? 0;
    const totalPatients = patientsRes?.data?.patientCount ?? 0;
    const totalRevenue = revRes?.data?.totalRevenue ?? 0;

    return [
      { title: "Tổng thú cưng", value: totalPatients },
      { title: "Người dùng", value: totalPatients },
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
    const res = await request("/user/all");
    const rows = Array.isArray(res) ? res : (res?.data || []);
    return rows.map((u) => ({
      id: u.user_id || u.id,
      name: u.fullName || `${u.first_name || ""} ${u.last_name || ""}`.trim(),
      email: u.email,
      phone: u.phone || "",
      pets: u.pets_count || 0,
      role: u.user_type || 'customer',
      is_active: typeof u.is_active === 'boolean' ? u.is_active : (u.status !== 'Tạm khóa'),
      status: u.status || (u.is_active ? "Hoạt động" : "Tạm khóa"),
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
    const res = await request("/api/users/me");
    // request() already returns parsed JSON (or null), for consistency return the user object
    return res?.data || res;
  } catch (err) {
    throw err;
  }
}

// Update profile (name/email)
export async function updateProfile(payload) {
  try {
    const res = await request('/api/users/me', { method: 'PUT', body: payload });
    return res || {};
  } catch (err) {
    throw err;
  }
}

// Change password
export async function changePassword(payload) {
  try {
    const res = await request('/api/users/change-password', { method: 'PUT', body: payload });
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
    // For feedback submissions from guests, don't attach Authorization header
    const res = await request("/feedback", { method: "POST", body: data, auth: false });
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
    const res = await request("/appointment/create", { method: "POST", body: payload });
    return res?.data || res;
  } catch (err) {
    throw err;
  }
}

export async function getMyAppointments() {
  try {
    const res = await request("/appointment/get");
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
    // Use the API-compatible users/pets endpoint so dev/prod use the same path
    const res = await request("/api/users/pets", { method: 'POST', body: payload });
    return res || {};
  } catch (err) {
    throw err;
  }
}

export async function getMyPets() {
  try {
    const res = await request("/api/users/pets");
    return res?.data || [];
  } catch (err) {
    return [];
  }
}

export async function getPet(petId) {
  try {
    const res = await request(`/pets/${petId}`);
    return res?.data || res;
  } catch (err) {
    throw err;
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
    const res = await request(`/pets/${petId}`, { method: 'DELETE' });
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
    const res = await request(`/user/${userId}/role`, { method: 'PUT', body: { role } });
    return res?.message || 'OK';
  } catch (err) {
    throw err;
  }
}

export async function lockUser(userId) {
  try {
    const res = await request(`/user/${userId}/lock`, { method: 'PUT' });
    return res?.message || 'OK';
  } catch (err) {
    throw err;
  }
}

export async function unlockUser(userId) {
  try {
    const res = await request(`/user/${userId}/unlock`, { method: 'PUT' });
    return res?.message || 'OK';
  } catch (err) {
    throw err;
  }
}

export async function deleteUser(userId) {
  try {
    const res = await request(`/user/${userId}`, { method: 'DELETE' });
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
    return res?.data || [];
  } catch (err) {
    await delay();
    return [];
  }
}

export async function getAdminDoctors() {
  try {
    const res = await request('/admin/doctors');
    return res?.data || [];
  } catch (err) {
    await delay();
    return [];
  }
}

export async function getAdminPets() {
  try {
    const res = await request('/admin/pets');
    return res?.data || [];
  } catch (err) {
    await delay();
    return [];
  }
}

// Compatibility `api` object used by some admin pages and legacy imports
export const api = {
  getVisits: async () => {
    try {
      const rows = await request('/admin/appointments');
      return rows?.data || rows || [];
    } catch (err) {
      await delay();
      return [];
    }
  },

  getServices: async () => {
    try {
      const res = await request('/admin/services');
      return res?.data || [];
    } catch (err) {
      await delay();
      return [];
    }
  },

  getMedications: async () => {
    try {
      const res = await request('/medicine');
      return res?.data || res || [];
    } catch (err) {
      await delay();
      return [];
    }
  },

  getInvoices: async () => {
    try {
      const res = await request('/admin/invoices');
      return res?.data || [];
    } catch (err) {
      await delay();
      return [];
    }
  },

  getHotelBookings: async () => {
    try {
      const res = await request('/admin/hotel/bookings');
      return res?.data || [];
    } catch (err) {
      await delay();
      return [];
    }
  },

  getHotelRooms: async () => {
    try {
      const res = await request('/admin/hotel/rooms');
      return res?.data || [];
    } catch (err) {
      await delay();
      return [];
    }
  },

  getMedicalRecords: async () => {
    try {
      const res = await request('/medical');
      return res?.data || [];
    } catch (err) {
      await delay();
      return [];
    }
  },

  getMedicalRecordByReportId: async (reportId) => {
    try {
      const res = await request(`/medical/report/${reportId}`);
      return res?.data || res || null;
    } catch (err) {
      await delay();
      return null;
    }
  },
};

// Also provide default export for compatibility
export default api;
