import { Phone, Mail, MapPin, PawPrint } from "lucide-react";
import About from "@/components/About";

export default function Footer() {
  return (
    <footer className="bg-[linear-gradient(170deg,#75C7BE_0%,#3B7798_47%,#87EBE0_100%)] text-white">
      <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Left */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white text-teal-500 rounded-full p-2">
              <PawPrint className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-semibold">Petorium Vet Clinic</h2>
          </div>
          <p className="text-md opacity-90 mb-2">
            <strong>Nhiệt huyết và tận tâm</strong> – Ngôi nhà thứ hai của thú
            cưng bạn
          </p>
          <p className="text-md opacity-90 leading-relaxed">
            Chúng tôi cung cấp dịch vụ chăm sóc tận tâm và chuyên nghiệp cho
            những người bạn lông xù của bạn!
          </p>
        </div>

        {/* Middle */}
        <div className="flex flex-col justify-center items-start md:items-center gap-3">
          <a href="/#about" className="hover:underline">
            About Us
          </a>
          <a href="#services" className="hover:underline">
            Services
          </a>
          <a href="#book" className="hover:underline">
            Book Now
          </a>
        </div>

        {/* Right */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5" />
            <span>0348780311</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5" />
            <span>petorium@vetclinic.com</span>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 mt-1" />
            <span>334 Nguyễn Trãi, Thanh Xuân, Hà Nội</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/20 py-6 text-center text-sm opacity-90">
        © 2025 Petorium Vet Clinic. All rights reserved. Made with ❤️ for pets
        and their families.
      </div>
    </footer>
  );
}
