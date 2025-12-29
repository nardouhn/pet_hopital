// src/components/LoginForm.jsx
import { useState } from "react";
import { PawPrint, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

import bgImage from "@/assets/image 17.png";

const USERS = [
  {
    email: "admin@gmail.com",
    password: "123456",
    role: "admin",
    name: "Admin",
    redirect: "/admin",
  },
  {
    email: "user@gmail.com",
    password: "123456",
    role: "user",
    name: "User",
    redirect: "/",
  },
];

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

    // Fake API login
    setTimeout(() => {
      const foundUser = USERS.find(
        (u) => u.email === form.email && u.password === form.password
      );

      if (foundUser) {
        localStorage.setItem(
          "auth",
          JSON.stringify({
            isAuthenticated: true,
            role: foundUser.role,
            user: {
              name: foundUser.name,
              email: foundUser.email,
            },
          })
        );

        navigate(foundUser.redirect);
      } else {
        setError("Email hoặc mật khẩu không đúng");
      }

      setLoading(false);
    }, 800);
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

      {/* Hint */}
      <p className="relative z-10 mt-4 text-xs text-gray-500 text-center">
        Admin: <b>admin@gmail.com</b> / <b>123456</b>
        <br />
        User: <b>user@gmail.com</b> / <b>123456</b>
      </p>
    </form>
  );
}
