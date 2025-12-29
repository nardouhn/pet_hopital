// import { Heart, PawPrint } from "lucide-react";

// export default function SignupForm() {
//   return (
//     <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-teal-200 shadow-xl p-8 max-w-xl w-full">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//         <div>
//           <label className="text-sm font-medium">Họ (First name) *</label>
//           <input
//             type="text"
//             placeholder="Nguyễn Quốc"
//             className="mt-1 w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-300"
//           />
//         </div>
//         <div>
//           <label className="text-sm font-medium">Tên (Last name) *</label>
//           <input
//             type="text"
//             placeholder="Hiếu"
//             className="mt-1 w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-300"
//           />
//         </div>

//         <div>
//           <label className="text-sm font-medium">Email *</label>
//           <input
//             type="email"
//             className="mt-1 w-full rounded-xl border px-4 py-2 bg-teal-100/60 focus:outline-none focus:ring-2 focus:ring-teal-300"
//           />
//         </div>
//         <div>
//           <label className="text-sm font-medium">Số điện thoại (Phone)</label>
//           <input
//             type="tel"
//             placeholder="0123456789"
//             className="mt-1 w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-300"
//           />
//         </div>

//         <div>
//           <label className="text-sm font-medium">Mật khẩu (Password) *</label>
//           <input
//             type="password"
//             className="mt-1 w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-300"
//           />
//         </div>
//         <div>
//           <label className="text-sm font-medium">Nhập lại mật khẩu *</label>
//           <input
//             type="password"
//             className="mt-1 w-full rounded-xl border px-4 py-2 bg-teal-100/60 focus:outline-none focus:ring-2 focus:ring-teal-300"
//           />
//         </div>
//       </div>

//       <button className="mt-8 w-full rounded-xl bg-[linear-gradient(135deg,#75C7BE_0%,#3B7798_47%,#87EBE0_100%)] py-3 text-white font-semibold flex items-center justify-center gap-2">
//         Đăng Ký (Sign up)
//         <PawPrint className="w-5 h-5" />
//       </button>
//     </div>
//   );
// }

import { useState } from "react";
import { Heart, PawPrint } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Spinner from "@/components/ui/Spinner";

export default function SignupForm() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setError("");

    // validation cơ bản
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu và nhập lại mật khẩu không khớp.");
      return;
    }

    setLoading(true);
    try {
      const res = await import("@/api/api").then(m => m.registerUser({ firstName, lastName, email, phone, password }));

      // nếu đăng ký thành công → điều hướng sang login
      if (res && res.code === 201) {
        toast.success('Đăng ký thành công');
        navigate("/login");
      } else {
        toast.error(res?.message || 'Đăng ký thất bại');
        setError(res?.message || "Đăng ký thất bại");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Đăng ký thất bại";
      setError(msg);
      toast.error(msg);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-teal-200 shadow-xl p-8 max-w-xl w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="text-sm font-medium">Họ (First name) *</label>
          <input
            type="text"
            placeholder="Nguyễn Quốc"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Tên (Last name) *</label>
          <input
            type="text"
            placeholder="Hiếu"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border px-4 py-2 bg-teal-100/60 focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Số điện thoại (Phone)</label>
          <input
            type="tel"
            placeholder="0123456789"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Mật khẩu (Password) *</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Nhập lại mật khẩu *</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border px-4 py-2 bg-teal-100/60 focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <button
        onClick={handleSignup}
        disabled={loading}
        className="mt-8 w-full rounded-xl bg-[linear-gradient(135deg,#75C7BE_0%,#3B7798_47%,#87EBE0_100%)] py-3 text-white font-semibold flex items-center justify-center gap-2"
      >
        {loading ? "Đang đăng ký..." : "Đăng Ký (Sign up)"}
        <PawPrint className="w-5 h-5" />
      </button>
    </div>
  );
}
