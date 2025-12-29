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

export default function About() {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <section id="about" className="bg-[#F0FAF9] py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Tiêu đề */}
        <div className="text-center mb-12" data-aos="fade-up">
          <span className="inline-flex items-center bg-[#D7F5F3] text-[#0891B2] font-medium px-4 py-1 rounded-full text-sm">
            <Users className="w-8 h-8 mr-4" /> Giới thiệu
          </span>
          <h2 className="text-4xl font-bold text-gray-800 mt-4">
            Petorium chúng tôi
          </h2>
          <p className="text-gray-600 mt-2 text-lg">
            Nơi lòng nhân ái gặp gỡ chuyên môn để chăm sóc những người bạn thân
            yêu của bạn.
          </p>
        </div>

        {/* Nội dung 2 cột */}
        <div className="grid md:grid-cols-2 gap-10">
          {/* Cột trái: Thông tin giới thiệu */}
          <div className="space-y-6">
            <div
              data-aos="fade-right"
              className="p-6 bg-white rounded-2xl shadow-md flex items-start hover:-translate-y-1 transition-transform"
            >
              <div className="bg-[#E6FCF1] p-3 rounded-full">
                <Heart className="text-[#0D9488]" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Hơn 15 năm yêu thương & chăm sóc
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Chúng tôi là đối tác đáng tin cậy của hàng ngàn gia đình nuôi
                  thú cưng trong cộng đồng.
                </p>
              </div>
            </div>

            <div
              data-aos="fade-right"
              data-aos-delay="150"
              className="p-6 bg-white rounded-2xl shadow-md flex items-start hover:-translate-y-1 transition-transform"
            >
              <div className="bg-[#E0F7FF] p-3 rounded-full">
                <Smile className="text-[#0EA5E9]" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Phương pháp chăm sóc toàn diện
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Kết hợp công nghệ y học hiện đại với sự tận tâm, mang đến dịch
                  vụ cá nhân hóa cho từng thú cưng.
                </p>
              </div>
            </div>

            <div
              data-aos="fade-right"
              data-aos-delay="300"
              className="p-6 bg-white rounded-2xl shadow-md flex items-start hover:-translate-y-1 transition-transform"
            >
              <div className="bg-[#FFF4E5] p-3 rounded-full">
                <Shield className="text-[#F97316]" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  An toàn của thú cưng là ưu tiên hàng đầu
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Cơ sở vật chất hiện đại cùng tiêu chuẩn thú y cao nhất giúp
                  bạn hoàn toàn yên tâm.
                </p>
              </div>
            </div>
          </div>

          {/* Cột phải: Đội ngũ bác sĩ */}
          <div
            data-aos="fade-left"
            className="p-6 bg-gradient-to-b from-[#CFFAFE] to-[#E0F7FF] rounded-2xl shadow-md hover:-translate-y-1 transition-transform"
          >
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <Stethoscope className="w-6 h-6 mr-2 text-[#0891B2]" /> Đội ngũ
              Bác sĩ
            </h3>

            <div className="space-y-3">
              {[
                {
                  name: "Phạm .T. Minh Thư",
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
                  className="bg-white p-4 rounded-xl shadow-sm flex items-start hover:-translate-y-1 transition-transform"
                  data-aos="fade-left"
                  data-aos-delay={index * 150}
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
