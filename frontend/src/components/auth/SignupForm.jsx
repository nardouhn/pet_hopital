import { Heart, PawPrint } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "@/assets/image 17.png";
import { register as apiRegister } from "@/api/mockApi";

export default function SignupForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Basic validations
    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.confirmPassword) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }
    if (!form.email.includes("@") || form.email.length < 5) {
      setError("Email không hợp lệ.");
      return;
    }
    if (form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      };
      const res = await apiRegister(payload);
      // Successful
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl border border-teal-200 shadow-xl p-8 max-w-md w-full"
    >
      {/* Background image */}
      <img
        src={bgImage}
        alt="background"
        className="pointer-events-none absolute inset-0 m-auto w-90 opacity-100"
      />

      <div className="relative z-10 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-sm font-medium">Họ (First name) *</label>
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              type="text"
              placeholder="Nguyễn Quốc"
              className="mt-1 w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Tên (Last name) *</label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              type="text"
              placeholder="Hiếu"
              className="mt-1 w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email *</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              required
              placeholder="you@example.com"
              className="mt-1 w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Số điện thoại (Phone)</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              type="tel"
              placeholder="0123456789"
              className="mt-1 w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Mật khẩu (Password) *</label>
            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              type="password"
              required
              placeholder="Ít nhất 6 ký tự"
              className="mt-1 w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Nhập lại mật khẩu *</label>
            <input
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              type="password"
              required
              placeholder="Nhập lại mật khẩu"
              className="mt-1 w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="relative z-10 mt-6 w-full rounded-xl bg-[linear-gradient(90deg,#14B8A6_0%,#0EA5E9_100%)] py-3 text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Đang đăng ký..." : "Đăng ký"}
          <PawPrint className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="relative z-10 mt-3 w-full rounded-xl border border-teal-200 py-3 text-teal-700 font-semibold flex items-center justify-center gap-2 hover:bg-teal-50"
        >
          Đã có tài khoản? Đăng nhập
        </button>

        <p className="relative z-10 mt-4 text-xs text-gray-500 text-center">
          Bằng việc đăng ký, bạn đồng ý với các điều khoản sử dụng của chúng tôi.
        </p>
      </div>
    </form>
  );
}

export default function SignupForm() {
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-teal-200 shadow-xl p-8 max-w-xl w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="text-sm font-medium">Họ (First name) *</label>
          <input
            type="text"
            placeholder="Nguyễn Quốc"
            className="mt-1 w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Tên (Last name) *</label>
          <input
            type="text"
            placeholder="Hiếu"
            className="mt-1 w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Email *</label>
          <input
            type="email"
            className="mt-1 w-full rounded-xl border px-4 py-2 bg-teal-100/60 focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Số điện thoại (Phone)</label>
          <input
            type="tel"
            placeholder="0123456789"
            className="mt-1 w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Mật khẩu (Password) *</label>
          <input
            type="password"
            className="mt-1 w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Nhập lại mật khẩu *</label>
          <input
            type="password"
            className="mt-1 w-full rounded-xl border px-4 py-2 bg-teal-100/60 focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
        </div>
      </div>

      <button className="mt-8 w-full rounded-xl bg-[linear-gradient(135deg,#75C7BE_0%,#3B7798_47%,#87EBE0_100%)] py-3 text-white font-semibold flex items-center justify-center gap-2">
        Đăng Ký (Sign up)
        <PawPrint className="w-5 h-5" />
      </button>
    </div>
  );
}
