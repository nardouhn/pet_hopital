// import { PawPrint } from "lucide-react";

// export default function LoginForm() {
//   return (
//     <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-teal-200 shadow-xl p-8 max-w-md w-full">
//       <div className="space-y-6">
//         <div>
//           <label className="text-sm font-medium">Email *</label>
//           <input
//             type="email"
//             className="mt-1 w-full rounded-xl border px-4 py-3 bg-teal-100/60 focus:outline-none focus:ring-2 focus:ring-teal-300"
//           />
//         </div>

//         <div>
//           <label className="text-sm font-medium">Mật khẩu (Password) *</label>
//           <input
//             type="password"
//             className="mt-1 w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-300"
//           />
//         </div>
//       </div>

//       <button className="mt-8 w-full rounded-xl bg-[linear-gradient(135deg,#75C7BE_0%,#3B7798_47%,#87EBE0_100%)] py-3 text-white font-semibold flex items-center justify-center gap-2">
//         Đăng nhập (Log in)
//         <PawPrint className="w-5 h-5" />
//       </button>
//     </div>
//   );
// }

import { useState } from "react";
import { PawPrint } from "lucide-react";
import { useNavigate } from "react-router-dom"; // dùng để điều hướng
import { toast } from "sonner";
import Spinner from "@/components/ui/Spinner";

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await import("@/api/api").then(m => m.loginUser({ email, password }));
      // Backend returns { status, success, message, data }
      if (res && res.status === 200) {
        toast.success("Đăng nhập thành công");
        // Redirect to homepage after successful login
        navigate("/", { replace: true });
      } else {
        setError(res?.message || "Đăng nhập thất bại");
        toast.error(res?.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Đăng nhập thất bại";
      setError(msg);
      toast.error(msg);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-teal-200 shadow-xl p-8 max-w-md w-full">
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border px-4 py-3 bg-teal-100/60 focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Mật khẩu (Password) *</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      <button
        onClick={handleLogin}
        disabled={loading}
        className="mt-8 w-full rounded-xl bg-[linear-gradient(135deg,#75C7BE_0%,#3B7798_47%,#87EBE0_100%)] py-3 text-white font-semibold flex items-center justify-center gap-2"
      >
        {loading ? "Đang đăng nhập..." : "Đăng nhập (Log in)"}
        <PawPrint className="w-5 h-5" />
      </button>
    </div>
  );
}
