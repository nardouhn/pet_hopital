import { Phone, Mail, MapPin, PawPrint } from "lucide-react";

export default function Footer({ variant = "default" }) {
  return (
    <footer className="bg-[linear-gradient(160deg,#6FC6C1_0%,#3E7FA0_50%,#7FE6DC_100%)] text-white">
      {variant === "default" ? <DefaultFooter /> : <CompactFooter />}

      <div className="border-t border-white/20 py-5 text-center text-sm opacity-90">
        © 2025 Petorium Vet Clinic. All rights reserved. Made with 💙 for pets
        and their families.
      </div>
    </footer>
  );
}

/* ================= DEFAULT (ẢNH 1) ================= */
function DefaultFooter() {
  return (
    <div>
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* LEFT */}
        <Brand1 />

        {/* RIGHT */}
        <Contact />
      </div>
      <Nav />
    </div>
  );
}

/* ================= COMPACT (ẢNH 2) ================= */
function CompactFooter() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* LEFT */}
        <Brand2 />

        {/* RIGHT */}
        <Contact />
      </div>
    </div>
  );
}

/* ================= SHARED COMPONENTS ================= */
function Brand1() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-white text-teal-500 rounded-full p-2">
          <PawPrint className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Petorium Vet Clinic</h2>
          <p className="text-sm opacity-90">
            Nhiệt huyết và tận tâm – Ngôi nhà thứ hai của thú cưng bạn
          </p>
        </div>
      </div>

      <p className="mt-4 text-lg italic opacity-95 leading-relaxed">
        Chúng tôi cung cấp dịch vụ chăm sóc tận tâm và chuyên nghiệp cho những
        người bạn lông xù của bạn !
      </p>
    </div>
  );
}

function Brand2() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-white text-teal-500 rounded-full p-2">
          <PawPrint className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Petorium Vet Clinic</h2>
          <p className="text-sm opacity-90">
            Nhiệt huyết và tận tâm – Ngôi nhà thứ hai của thú cưng bạn
          </p>
        </div>
      </div>
      <Nav />
    </div>
  );
}
function Nav({ dots = false }) {
  return (
    <div className="flex justify-center items-center gap-8 text-md">
      <a href="/#about" className="hover:underline">
        About Us
      </a>
      <span className="text-teal-200">•</span>
      <a href="/#services" className="hover:underline">
        Services
      </a>
      <span className="text-teal-200">•</span>
      <a href="/#book" className="hover:underline">
        Book Now
      </a>
    </div>
  );
}

function Contact() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="bg-white/20 p-2 rounded-full">
          <Phone className="w-5 h-5" />
        </div>
        <span>0348780311</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="bg-white/20 p-2 rounded-full">
          <Mail className="w-5 h-5" />
        </div>
        <span>petorium@vetclinic.com</span>
      </div>

      <div className="flex items-start gap-4">
        <div className="bg-white/20 p-2 rounded-full mt-1">
          <MapPin className="w-5 h-5" />
        </div>
        <span>334 Nguyễn Trãi, Thanh Xuân, Hà Nội</span>
      </div>
    </div>
  );
}
