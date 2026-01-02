import React, { useState, useEffect } from "react";
import { User, PawPrint, Edit2, Plus, Heart, CheckCircle } from "lucide-react";
import Navbar from "@/layouts/NavBar";
import Footer from "@/layouts/Footer";
import {
  createPet,
  getProfile,
  updateProfile,
  changePassword,
} from "@/api/mockApi";

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Add Pet modal state
  const [showAddPet, setShowAddPet] = useState(false);
  const [petForm, setPetForm] = useState({ name: "", breed: "", age: "" });
  const [petLoading, setPetLoading] = useState(false);
  const [petError, setPetError] = useState("");

  const setPetField = (k, v) => setPetForm((p) => ({ ...p, [k]: v }));

  // 1. Lấy dữ liệu người dùng từ backend (GET /api/users/me)
  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserProfile = async () => {
    try {
      const result = await getProfile();
      if (result) {
        // result is the user object (not wrapped) from getProfile()
        const user = result;
        setUserData(user);
        setFormData((fd) => ({
          ...fd,
          firstName: user?.first_name || user?.firstName || "",
          lastName: user?.last_name || user?.lastName || "",
          email: user?.email || "",
        }));

        // Update local auth cache so NavBar and other components show backend values
        try {
          const authRaw = localStorage.getItem("auth");
          const authObj = authRaw ? JSON.parse(authRaw) : {};
          const updatedAuth = {
            ...authObj,
            isAuthenticated: true,
            role: user?.user_type || authObj.role,
            user: {
              name:
                `${user?.first_name || user?.firstName || ""} ${
                  user?.last_name || user?.lastName || ""
                }`.trim() || authObj?.user?.name,
              email: user?.email || authObj?.user?.email,
              pets_count:
                user?.pets_count ?? (user?.pets ? user.pets.length : 0),
              pets: user?.pets || authObj?.user?.pets || [],
            },
          };
          localStorage.setItem("auth", JSON.stringify(updatedAuth));
          try {
            window.dispatchEvent(new Event("authChanged"));
          } catch (e) {}
        } catch (e) {
          // ignore localStorage errors
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Xử lý cập nhật thông tin (PUT /api/users/me & PUT /api/users/change-password)
  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setSuccessMessage("");

    // Client-side validation
    const errors = {};
    if (!formData.email || !formData.email.includes("@")) {
      errors.email = "Email không hợp lệ";
    }
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = "Mật khẩu nhập lại không khớp";
      }
      if (!formData.currentPassword) {
        errors.currentPassword =
          "Mật khẩu hiện tại là bắt buộc để đổi mật khẩu";
      }
      if (formData.newPassword.length < 8) {
        errors.newPassword = "Mật khẩu mới phải ít nhất 8 ký tự";
      }
    }

    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    // Submit
    setSubmitting(true);
    try {
      // Update basic profile fields
      await updateProfile({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
      });

      // If changing password, call changePassword
      if (formData.newPassword) {
        await changePassword({
          current_password: formData.currentPassword,
          new_password: formData.newPassword,
        });
      }

      setSuccessMessage("Cập nhật thành công!");
      setIsEditing(false);
      // Refresh profile to ensure canonical state
      await fetchUserProfile();
    } catch (err) {
      // Show server error message
      const msg = err?.message || String(err) || "Lỗi khi cập nhật";
      setFormErrors({ general: msg });
    } finally {
      setSubmitting(false);
    }
  };

  // Add pet submit
  const submitAddPet = async (e) => {
    e && e.preventDefault();
    setPetError("");
    if (!petForm.name) {
      setPetError("Tên thú cưng là bắt buộc");
      return;
    }
    try {
      setPetLoading(true);
      // Use central API helper (attach base URL and token automatically)
      const result = await createPet({
        name: petForm.name,
        breed: petForm.breed,
        age: petForm.age || null,
      });

      // Optimistically update UI using returned pet if available
      const createdPet =
        result?.data?.pet || result?.pet || result?.data || null;
      if (createdPet) {
        setUserData((prev) => {
          const prevPets = prev?.pets || [];
          const newPets = [createdPet, ...prevPets];
          const newCount = (prev?.pets_count || prevPets.length) + 1;
          const updated = {
            ...(prev || {}),
            pets: newPets,
            pets_count: newCount,
          };
          // sync localStorage cache too
          try {
            const authRaw = localStorage.getItem("auth");
            const authObj = authRaw ? JSON.parse(authRaw) : {};
            const updatedAuth = {
              ...authObj,
              user: {
                ...(authObj.user || {}),
                pets_count: newCount,
                pets: newPets,
              },
            };
            localStorage.setItem("auth", JSON.stringify(updatedAuth));
            try {
              window.dispatchEvent(new Event("authChanged"));
            } catch (e) {}
          } catch (e) {}
          return updated;
        });
      }

      // re-sync with server to ensure canonical state
      await fetchUserProfile();
      setShowAddPet(false);
      setPetForm({ name: "", breed: "", age: "" });
      alert(result?.message || "Thêm thú cưng thành công");
    } catch (err) {
      setPetError(err.message || "Đã có lỗi");
    } finally {
      setPetLoading(false);
    }
  };

  if (loading) return <div className="text-center p-10">Đang tải...</div>;

  return (
    <div className="min-h-screen font-sans text-slate-900 bg-gradient-to-b from-emerald-50 via-emerald-50 to-emerald-100">
      <Navbar />
      <main className="pt-28">
        <div className="max-w-5xl mx-auto py-8 px-4">
          {!isEditing && (
            <div className="mb-6 inline-flex items-center bg-[#e0f7f7] text-[#2e94a5] px-4 py-3 rounded-2xl font-medium shadow-sm border border-teal-50">
              Đang chờ quản trị viên phê duyệt !
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm p-8 mb-6 border border-gray-50">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <User className="text-blue-400" size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  User Profile
                </h2>
                <p className="text-xs text-gray-400">
                  Manage your personal information
                </p>
              </div>
            </div>

            {!isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Họ tên
                  </label>
                  <p className="font-semibold">
                    {userData?.first_name} {userData?.last_name}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Email
                  </label>
                  <p className="text-gray-600">{userData?.email}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-2">
                    User Type
                  </label>
                  <span className="bg-[#e0f7f7] text-[#2e94a5] px-3 py-1 rounded-full text-xs font-semibold flex items-center w-fit gap-1">
                    <CheckCircle size={12} />{" "}
                    {userData?.user_type || "Customer"}
                  </span>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-6 flex items-center gap-2 bg-[#a1aab2] text-white px-6 py-2 rounded-lg text-sm hover:bg-gray-500 transition-colors"
                >
                  <Edit2 size={14} /> Sửa thông tin
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="grid grid-cols-2 gap-6">
                <div className="col-span-1">
                  <label className="text-xs text-gray-400 block mb-1 uppercase">
                    Họ
                  </label>
                  <input
                    className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-[#2e94a5]"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-xs text-gray-400 block mb-1 uppercase">
                    Tên
                  </label>
                  <input
                    className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-[#2e94a5]"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 block mb-1 uppercase">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-[#2e94a5]"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-xs text-gray-400 block mb-1 uppercase">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-[#2e94a5]"
                    placeholder="Để trống nếu không đổi"
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-xs text-gray-400 block mb-1 uppercase">
                    Nhập lại mật khẩu
                  </label>
                  <input
                    type="password"
                    className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-[#2e94a5]"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>
                {formData.newPassword && (
                  <div className="col-span-2">
                    <label className="text-xs text-red-400 block mb-1 uppercase">
                      Mật khẩu hiện tại (để xác nhận)
                    </label>
                    <input
                      type="password"
                      className="w-full border border-red-100 bg-red-50 rounded-md p-2 focus:outline-none"
                      value={formData.currentPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          currentPassword: e.target.value,
                        })
                      }
                    />
                    {formErrors.currentPassword && (
                      <p className="text-sm text-red-600 mt-1">
                        {formErrors.currentPassword}
                      </p>
                    )}
                  </div>
                )}

                {formErrors.general && (
                  <div className="col-span-2">
                    <p className="text-sm text-red-600">{formErrors.general}</p>
                  </div>
                )}
                {successMessage && (
                  <div className="col-span-2">
                    <p className="text-sm text-green-600">{successMessage}</p>
                  </div>
                )}

                <div className="col-span-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`flex items-center gap-2 ${
                      submitting ? "opacity-60 cursor-not-allowed" : ""
                    } bg-[#2e94a5] text-white px-6 py-2 rounded-lg text-sm hover:bg-[#257a8a]`}
                  >
                    <Edit2 size={14} />{" "}
                    {submitting ? "Đang cập nhật..." : "Xác nhận sửa"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg text-sm hover:bg-gray-200"
                  >
                    Hủy bỏ
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-50">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                  <PawPrint className="text-green-400" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">My Pets</h2>
                  <p className="text-xs text-gray-400">
                    {userData?.pets_count ?? 0} pet registered
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddPet(true)}
                className="flex items-center gap-2 bg-[#2e94a5] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#257a8a]"
              >
                <Plus size={16} /> Add New Pet
              </button>
            </div>

            {userData?.pets && userData.pets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userData.pets.map((pet) => (
                  <div
                    key={pet.pet_id}
                    className="border border-gray-100 rounded-xl p-6 flex items-start gap-4"
                  >
                    <div className="w-12 h-12 border border-green-100 rounded-full flex items-center justify-center bg-white shadow-sm">
                      <Heart className="text-green-400" size={20} />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-bold text-gray-800">{pet.name}</h3>
                        <span className="bg-blue-50 text-blue-400 text-[10px] px-2 py-0.5 rounded-full border border-blue-100">
                          {pet.age ? `${pet.age} years` : "-"}
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 mb-4 font-medium italic">
                        {pet.breed || "-"}
                      </p>

                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-400">Breed:</span>
                        <span className="text-gray-700 font-medium">
                          {pet.breed || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-sm italic">
                No pets registered yet.
              </div>
            )}
          </div>
        </div>

        {/* Add Pet Modal */}
        {showAddPet && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Add New Pet</h3>
              <form onSubmit={submitAddPet} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">
                    Name *
                  </label>
                  <input
                    value={petForm.name}
                    onChange={(e) => setPetField("name", e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">
                    Breed
                  </label>
                  <input
                    value={petForm.breed}
                    onChange={(e) => setPetField("breed", e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">
                    Age
                  </label>
                  <input
                    value={petForm.age}
                    onChange={(e) => setPetField("age", e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>

                {petError && <p className="text-sm text-red-600">{petError}</p>}

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddPet(false)}
                    className="px-4 py-2 rounded-md border"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={petLoading}
                    type="submit"
                    className="px-4 py-2 rounded-md bg-teal-600 text-white"
                  >
                    {petLoading ? "Adding..." : "Add Pet"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <Footer />
      </main>
    </div>
  );
};

export default UserProfile;
