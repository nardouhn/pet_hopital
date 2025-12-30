import LoginForm from "@/components/auth/LoginForm";

import NavBar from "@/layouts/NavBar";
import Footer from "@/layouts/Footer";
import { Heart, PawPrint } from "lucide-react";
import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-teal-50 to-white">
      <NavBar />

      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-100 px-4 py-1 text-sm text-teal-700">
          <Heart className="w-4 h-4" /> Log in
        </span>

        <h1 className="text-3xl md:text-4xl font-bold mb-8">Đăng nhập</h1>

        <LoginForm />

        <div className="mt-6 w-full max-w-xl bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-center h-full">
            <Link
              to="/signup"
              className="w-1/2 rounded-xl bg-[linear-gradient(90deg,#14B8A6_0%,#0EA5E9_100%)] py-3 text-white font-semibold flex items-center justify-center gap-2 hover:bg-teal-600 transition"
            >
              ♡ Đăng ký (Sign up)
              <PawPrint className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </main>

      <Footer variant="compact" />
    </div>
  );
}
