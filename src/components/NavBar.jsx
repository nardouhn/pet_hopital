// src/components/Navbar.jsx
import { PawPrint } from "lucide-react";

export default function Navbar() {
  return (
    <header className="w-full bg-white shadow-sm fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6 border-b border-teal-100">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="bg-[#D7F5F3] p-2 rounded-full">
            <PawPrint className="text-[#0891B2] w-5 h-5" />
          </div>
          <a href="home" className="font-bold text-xl text-[#0D9488]">
            Petorium Vet Clinic
          </a>
        </div>

        {/* Menu */}
        <nav className="hidden md:flex space-x-8 text-gray-600 font-medium">
          <a href="#about" className="hover:text-[#0891B2] transition-colors">
            About
          </a>
          <a
            href="#services"
            className="hover:text-[#0891B2] transition-colors"
          >
            Services
          </a>
          <a href="#book" className="hover:text-[#0891B2] transition-colors">
            Book Now
          </a>
          <a
            href="#testimonials"
            className="hover:text-[#0891B2] transition-colors"
          >
            Testimonials
          </a>
          <a href="" className="hover:text-[#0891B2] transition-colors">
            Login/ Sign up
          </a>
        </nav>
      </div>
      <div className="border-b border-[#7DE2D1]"></div>
    </header>
  );
}
