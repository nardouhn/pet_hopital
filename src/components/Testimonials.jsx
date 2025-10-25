/* /components/Testimonials.jsx */
import React from "react";
const testimonials = [
  {
    name: "Nguyễn Lan",
    text: "Dịch vụ tuyệt vời, nhân viên rất tận tâm và yêu động vật!",
  },
  {
    name: "Trần Huy",
    text: "Phòng khám sạch sẽ, bác sĩ chuyên nghiệp, giá cả hợp lý.",
  },
  {
    name: "Lê Thảo",
    text: "Thú cưng của tôi được chăm sóc rất chu đáo, cảm ơn Petorium!",
  },
];
export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-emerald-50">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-emerald-600 mb-12">
          Khách hàng nói gì
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-2xl shadow hover:shadow-lg transition"
            >
              <div className="text-5xl mb-4">🐶</div>
              <p className="text-slate-600 mb-4 italic">“{t.text}”</p>
              <div className="font-semibold text-emerald-600">{t.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
