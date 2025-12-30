// src/components/About.jsx
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  Heart,
  Smile,
  Shield,
  Users,
  Stethoscope,
  PawPrint,
} from "lucide-react";

import aboutImage from "../assets/image 5.png";

export default function About() {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <section
      id="about"
      className="bg-gradient-to-b from-white to-teal-50 py-20 px-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Tiêu đề */}
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="inline-flex items-center bg-[#CCFBF1] text-[#0F766E] font-bold px-5 py-2 rounded-full text-sm">
            <Users className="w-5 h-5 text-[#0D9488] mr-2" /> Giới thiệu
          </span>
          <h2 className="text-4xl font-bold text-gray-800 mt-4">
            Petorium chúng tôi
          </h2>
          <p className="text-gray-600 mt-2 text-[17px] max-w-2xl mx-auto">
            Nơi lòng nhân ái gặp gỡ chuyên môn để chăm sóc những người bạn thân
            yêu của bạn.
          </p>
        </div>

        {/* Nội dung 3 cột */}
        <div className="grid lg:grid-cols-3 gap-12 items-center">
          {/* Cột trái */}
          <div className="space-y-6">
            <InfoCard
              icon={<Heart className="text-[#0D9488]" />}
              bg="#CCFBF1"
              title="Hơn 15 năm yêu thương & chăm sóc"
              desc="Chúng tôi là đối tác đáng tin cậy của hàng ngàn gia đình nuôi thú cưng trong cộng đồng."
              delay={0}
            />

            <InfoCard
              icon={<Smile className="text-[#0284C7]" />}
              bg="#E1F2FF"
              title="Phương pháp chăm sóc toàn diện"
              desc="Kết hợp công nghệ y học hiện đại với sự tận tâm, mang đến dịch vụ cá nhân hóa cho từng thú cưng."
              delay={150}
            />

            <InfoCard
              icon={<Shield className="text-[#EA580C]" />}
              bg="#FFEDD5"
              title="An toàn của thú cưng là ưu tiên hàng đầu"
              desc="Cơ sở vật chất hiện đại cùng tiêu chuẩn thú y cao nhất giúp bạn hoàn toàn yên tâm."
              delay={300}
            />
          </div>

          {/* Ảnh trung tâm */}
          <div className="flex justify-center relative" data-aos="zoom-in">
            <img
              src={aboutImage}
              alt="Pet care"
              className="max-w-sm w-full drop-shadow-xl"
            />
          </div>

          {/* Cột phải */}
          <div
            data-aos="fade-left"
            className="p-6 bg-[linear-gradient(126deg,#CCFBF1_0%,#E1F2FF_100%)] rounded-2xl shadow-md"
          >
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <Stethoscope className="w-6 h-6 mr-2 text-[#0891B2]" />
              Đội ngũ Bác sĩ
            </h3>

            <div className="space-y-3">
              {[
                {
                  name: "Phạm Thị Minh Thư",
                  role: "Trưởng bác sĩ thú y – Hơn 20 năm kinh nghiệm",
                  color: "#0D9488",
                },
                {
                  name: "Đỗ Thị Mây",
                  role: "Chuyên gia phẫu thuật & cấp cứu thú y",
                  color: "#0EA5E9",
                },
                {
                  name: "Nguyễn Tuyết Như",
                  role: "Chuyên gia động vật nhỏ & thú cưng đặc biệt",
                  color: "#F97316",
                },
                {
                  name: "Đội ngũ hỗ trợ",
                  role: "Kỹ thuật viên thú y & nhân viên chăm sóc tận tâm",
                  color: "#EC4899",
                },
              ].map((doctor, index) => (
                <div
                  key={index}
                  data-aos="fade-left"
                  data-aos-delay={index * 150}
                  className="bg-white p-4 rounded-xl shadow-sm flex items-start hover:-translate-y-1 transition-transform"
                >
                  <PawPrint className="mt-1" style={{ color: doctor.color }} />
                  <div className="ml-3">
                    <p className="font-medium text-gray-800">{doctor.name}</p>
                    <p className="text-sm text-gray-600">{doctor.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Components */
function InfoCard({ icon, title, desc, bg, delay }) {
  return (
    <div
      data-aos="fade-right"
      data-aos-delay={delay}
      className="p-6 bg-white rounded-2xl shadow-md flex items-start hover:-translate-y-1 transition-transform"
    >
      <div className="p-3 rounded-full" style={{ backgroundColor: bg }}>
        {icon}
      </div>
      <div className="ml-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-600 text-sm mt-1">{desc}</p>
      </div>
    </div>
  );
}
