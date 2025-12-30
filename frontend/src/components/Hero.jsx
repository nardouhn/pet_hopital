// src/components/Hero.jsx
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  // helper to check simple auth state stored in localStorage
  const isAuthenticated = () => {
    try {
      const a = JSON.parse(localStorage.getItem('auth'));
      return !!(a && a.isAuthenticated);
    } catch (e) { return false; }
  };

  return (
    <section
      id="home"
      className="pt-32 pb-20 bg-[#F0FAF9] min-h-[90vh] flex items-center"
    >
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center px-6">
        {/* Left content */}
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 bg-[#D7F5F3] text-[#0D9488] px-4 py-1 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4" /> Tin tưởng từ 100+ gia đình
          </span>

          <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-4">
            Chăm sóc thú cưng <br />
            của bạn <br />
            <span className="bg-[linear-gradient(90deg,#14B8A6_0%,#0EA5E9_100%)] bg-clip-text text-transparent">
              Niềm vui của chúng tôi!
            </span>
          </h1>

          <p className="text-gray-600 text-lg mb-6 max-w-xl">
            Chúng tôi cung cấp dịch vụ chăm sóc tận tâm và chuyên nghiệp cho
            những người bạn lông xù của bạn.
          </p>

          {/* Contact info */}
          <ul className="space-y-3 mb-8 text-gray-700">
            <li className="flex items-center">
              <Phone className="text-[#0D9488] w-5 h-5 mr-3" /> 09112025
            </li>
            <li className="flex items-center">
              <Mail className="text-[#0EA5E9] w-5 h-5 mr-3" />{" "}
              petorium@vetclinic.com
            </li>
            <li className="flex items-center">
              <MapPin className="text-[#F97316] w-5 h-5 mr-3" /> 334 Nguyễn
              Trãi, Thanh Xuân, Hà Nội
            </li>
          </ul>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                return navigate('/#book');
              }}
              className="flex items-center bg-[#0D9488] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#0B7D74] transition-colors shadow-md cursor-pointer"
            >
              Đặt lịch hẹn <Heart className="ml-2 w-5 h-5 text-white" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/#services')}
              className="flex items-center border-2 border-[#0D9488] text-[#0D9488] px-6 py-3 rounded-full font-semibold hover:bg-[#0D9488] hover:text-white transition-colors cursor-pointer"
            >
              Dịch vụ của chúng tôi
            </motion.button>
          </div>
        </motion.div>

        {/* Right visual */}
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative flex justify-center"
        >
          <img
            src={heroImage}
            className="max-w-md w-full mt-6 object-contain scale-125"
            style={{ backgroundColor: "transparent" }}
          />

          {/* Decorations */}
          <div className="absolute -top-1/12 -right-5 bg-[#FDE047] p-3 rounded-full shadow-md text-white">
            ⭐
          </div>
          <div className="absolute -bottom-11 left-5 bg-pink-400 p-3 rounded-full shadow-md text-white">
            <Heart className="w-5 h-5" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
