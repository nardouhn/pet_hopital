import api from "@/lib/axios";

// Auth
export const registerUser = async (userData) => {
  const res = await api.post('/auth/register', userData, { withCredentials: true });
  return res.data;
};

export const loginUser = async (loginData) => {
  const res = await api.post('/auth/login', loginData, { withCredentials: true });
  // store token for subsequent requests
  if (res.data?.data?.accessToken) {
    localStorage.setItem('token', res.data.data.accessToken);
    // notify UI
    window.dispatchEvent(new Event('user:login'));
  }
  return res.data;
};

export const logoutUser = async () => {
  try {
    const res = await api.post('/auth/logout', null, { withCredentials: true });
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('user:logout'));
    return res.data;
  } catch (error) {
    // still remove token and notify
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('user:logout'));
    throw error;
  }
};

export const getMe = async () => {
  const res = await api.get('/auth/me', { withCredentials: true });
  return res.data;
};

// Users
export const getProfile = async () => {
  const res = await api.get('/users/profile');
  return res.data;
};

export const updateProfile = async (payload) => {
  const res = await api.put('/users/profile', payload);
  return res.data;
};

// Pets
export const createPet = async (payload) => {
  const res = await api.post('/pets', payload);
  return res.data;
};
export const getPets = async () => {
  const res = await api.get('/pets');
  return res.data;
};
export const getPet = async (id) => {
  const res = await api.get(`/pets/${id}`);
  return res.data;
};
export const updatePet = async (id, payload) => {
  const res = await api.put(`/pets/${id}`, payload);
  return res.data;
};
export const deletePet = async (id) => {
  const res = await api.delete(`/pets/${id}`);
  return res.data;
};
export const getPetMedicalRecords = async (id) => {
  const res = await api.get(`/pets/${id}/medical-records`);
  return res.data;
};

// Appointments
export const createAppointment = async (payload) => {
  const res = await api.post('/appointment', payload);
  return res.data;
};
export const getMyAppointments = async () => {
  const res = await api.get('/appointment/my');
  return res.data;
};
export const getAppointmentById = async (id) => {
  const res = await api.get(`/appointment/${id}`);
  return res.data;
};
export const updateAppointment = async (id, payload) => {
  const res = await api.put(`/appointment/${id}`, payload);
  return res.data;
};

export const adminGetAppointments = async () => {
  const res = await api.get('/admin/appointments');
  return res.data;
};
export const adminUpdateAppointmentStatus = async (id, payload) => {
  const res = await api.put(`/admin/appointments/${id}/status`, payload);
  return res.data;
};
export const adminAssignDoctor = async (id, payload) => {
  const res = await api.put(`/admin/appointments/${id}/assign-doctor`, payload);
  return res.data;
};

// Medical records
export const createMedicalRecord = async (payload) => {
  const res = await api.post('/medical-records', payload);
  return res.data;
};
export const updateMedicalRecord = async (id, payload) => {
  const res = await api.put(`/medical-records/${id}`, payload);
  return res.data;
};
export const getMedicalRecord = async (id) => {
  const res = await api.get(`/medical-records/${id}`);
  return res.data;
};

// Services & Medicines
export const getServices = async () => {
  const res = await api.get('/services');
  return res.data;
};
export const getMedicines = async () => {
  const res = await api.get('/medicines');
  return res.data;
};
export const createService = async (payload) => { const res = await api.post('/services', payload); return res.data; };
export const updateService = async (id, payload) => { const res = await api.put(`/services/${id}`, payload); return res.data; };
export const deleteService = async (id) => { const res = await api.delete(`/services/${id}`); return res.data; };
export const createMedicine = async (payload) => { const res = await api.post('/medicines', payload); return res.data; };
export const updateMedicine = async (id, payload) => { const res = await api.put(`/medicines/${id}`, payload); return res.data; };
export const deleteMedicine = async (id) => { const res = await api.delete(`/medicines/${id}`); return res.data; };

// Staff
export const createStaff = async (payload) => { const res = await api.post('/staff', payload); return res.data; };
export const getStaff = async () => { const res = await api.get('/staff'); return res.data; };
export const updateStaff = async (id, payload) => { const res = await api.put(`/staff/${id}`, payload); return res.data; };
export const deleteStaff = async (id) => { const res = await api.delete(`/staff/${id}`); return res.data; };
export const createStaffSchedule = async (id, payload) => { const res = await api.post(`/staff/${id}/schedules`, payload); return res.data; };
export const getStaffSchedules = async (id) => { const res = await api.get(`/staff/${id}/schedules`); return res.data; };

// Statistics
export const getAppointmentsStats = async () => { const res = await api.get('/admin/statistics/appointments'); return res.data; };
export const getRevenueStats = async () => { const res = await api.get('/admin/statistics/revenue'); return res.data; };
export const getPatientsStats = async () => { const res = await api.get('/admin/statistics/patients'); return res.data; };
export const getServicesStats = async () => { const res = await api.get('/admin/statistics/services'); return res.data; };

// Feedback
export const createFeedback = async (payload) => { const res = await api.post('/feedback', payload); return res.data; };
export const getMyFeedback = async () => { const res = await api.get('/feedback/my'); return res.data; };
export const adminGetAllFeedback = async () => { const res = await api.get('/feedback/admin'); return res.data; };
export const adminReplyFeedback = async (id, payload) => { const res = await api.put(`/feedback/admin/${id}/reply`, payload); return res.data; };
