// src/components/LoginForm.jsx
import { useState } from "react";
import { PawPrint, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

import bgImage from "@/assets/image 17.png";
import { login as apiLogin } from "@/api/mockApi";

export default function LoginForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Real API login
    try {
      const res = await apiLogin(form.email, form.password);
      const accessToken = res?.accessToken || res?.data?.accessToken || res?.token;
      const userObj = res?.user || res?.data?.user || null;

      if (!accessToken || !userObj) {
        throw new Error('Đăng nhập thất bại: không có token');
      }

      localStorage.setItem(
        "auth",
        JSON.stringify({
          isAuthenticated: true,
          role: userObj.user_type || userObj.role || 'customer',
          user: {
            name: `${userObj.first_name || ''} ${userObj.last_name || ''}`.trim() || userObj.name || userObj.email,
            email: userObj.email,
          },
          accessToken,
        })
      );

      // Notify other parts of the app (same tab and other tabs) that auth changed
      try {
        window.dispatchEvent(new Event('authChanged'));
      } catch (e) {}

      // Navigate to home after a tiny delay so components have time to react
      setTimeout(() => navigate('/'), 50);
    } catch (err) {
      setError(err?.message || "Đăng nhập thất bại");
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

      {/* Content */}
      <div className="relative z-10 space-y-6">
        {/* Email */}
        <div>
          <label className="text-sm font-medium flex items-center gap-2">
            <Mail className="w-4 h-4 text-teal-600" />
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="admin@gmail.com"
            className="mt-1 w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-sm font-medium flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-600" />
            Mật khẩu
          </label>
          <input
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
            placeholder="••••••"
            className="mt-1 w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">
            {error}
          </p>
        )}
      </div>

      {/* Button */}
      <button
        type="submit"
        disabled={loading}
        className="relative z-10 mt-8 w-full rounded-xl bg-[linear-gradient(90deg,#14B8A6_0%,#0EA5E9_100%)] py-3 text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        <PawPrint className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={() => navigate('/signup')}
        className="relative z-10 mt-3 w-full rounded-xl border border-teal-200 py-3 text-teal-700 font-semibold flex items-center justify-center gap-2 hover:bg-teal-50"
      >
        Đăng ký
      </button>

      {/* Hint */}
      <p className="relative z-10 mt-4 text-xs text-gray-500 text-center">
        Admin: <b>admin@gmail.com</b> / <b>123456</b>
        <br />
        User: <b>user@gmail.com</b> / <b>123456</b>
      </p>
    </form>
  );
}