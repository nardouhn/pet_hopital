import { Heart, PawPrint } from "lucide-react";

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
