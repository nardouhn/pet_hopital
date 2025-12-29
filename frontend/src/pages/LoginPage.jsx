import LoginForm from "@/components/auth/LoginForm";

import NavBar from "@/layouts/NavBar";
import Footer from "@/layouts/Footer";
import { Heart } from "lucide-react";

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
      </main>

      <Footer />
    </div>
  );
}
