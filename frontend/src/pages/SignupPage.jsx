import NavBar from "@/layouts/NavBar";
import Footer from "@/layouts/Footer";
import SignupForm from "@/components/auth/SignupForm";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-teal-50 to-white">
      <NavBar />

      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-100 px-4 py-1 text-sm text-teal-700">
          <Heart className="w-4 h-4" /> Sign up
        </span>

        <h1 className="text-3xl md:text-4xl font-bold mb-8">Đăng ký</h1>

        <SignupForm />

        <div className="mt-6 w-full max-w-xl bg-white rounded-xl shadow-md p-4">
          <Link
            to="/login"
            className="w-full rounded-xl bg-[linear-gradient(90deg,#14B8A6_0%,#0EA5E9_100%)] py-3 text-white font-semibold flex items-center justify-center gap-2 hover:bg-teal-600 transition"
          >
            ♡ Đăng nhập (Log in)
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
