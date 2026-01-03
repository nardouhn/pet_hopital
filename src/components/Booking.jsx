import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Calendar, PawPrint, CheckCircle2, X } from "lucide-react";
import { Clock } from "lucide-react";
import DatePicker from "react-datepicker";

const Booking = () => {
  const [form, setForm] = useState({
    ownerName: "",
    petName: "",
    petType: "",
    service: "",
    date: null,
    timeSlot: "",
    description: "",
  });

  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Kiểm tra đơn giản
    if (
      !form.ownerName ||
      !form.petName ||
      !form.petType ||
      !form.service ||
      !form.date
    ) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // Hiện popup xác nhận
    setShowModal(true);

    // Reset form
    setForm({
      ownerName: "",
      petName: "",
      petType: "",
      service: "",
      date: null,
      timeSlot: "",
      description: "",
    });
  };

  const inputStyle = (value) =>
    `w-full rounded-lg px-4 py-2 border transition-all duration-200
   ${value ? "bg-[#CCFBF1] border-teal-300" : "bg-white border-gray-200"}
   focus:outline-none focus:ring-2 focus:ring-teal-300`;

  return (
    <section id="book" className="py-20 bg-[#F0FAF9]">
      <div className="max-w-5xl mx-auto px-6">
        {/* Tiêu đề */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-[#CCFBF1] px-4 py-2">
            <Heart className="h-5 w-5 text-emerald-500" />

            <span className="text-sm font-medium text-emerald-700">
              Chúng tôi luôn sẵn sàng!
            </span>
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-2">
            Đặt lịch ngay!
          </h2>
          <p className="text-gray-600">
            Chúng tôi xác nhận lịch hẹn trong vòng 24 giờ 🕒
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-lg p-8 md:p-10 border border-teal-100"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {/* Tên chủ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên chủ*
              </label>
              <input
                type="text"
                name="ownerName"
                value={form.ownerName}
                onChange={handleChange}
                placeholder="Nguyễn Quốc"
                className={inputStyle(form.ownerName)}
                required
              />
            </div>

            {/* Tên thú cưng */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên thường gọi của thú cưng 
              </label>
              <input
                type="text"
                name="petName"
                value={form.petName}
                onChange={handleChange}
                placeholder="Hiệu"
                className={inputStyle(form.petName)}
                
              />
            </div>

            {/* Loại thú */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thú cưng nhà bạn là giống gì? 
              </label>
              <input
                type="text"
                name="petType"
                value={form.petType}
                onChange={handleChange}
                placeholder="Chó, mèo,..."
                className={inputStyle(form.petType)}
                
              />
            </div>

            {/* Dịch vụ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dịch vụ bạn muốn làm
              </label>
              <input
                type="text"
                name="service"
                value={form.service}
                onChange={handleChange}
                placeholder="Khám sức khỏe, tiêm phòng..."
                className={inputStyle(form.service)}
              />
            </div>

            {/* Lịch */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày thăm khám*
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <DatePicker
                  selected={form.date}
                  onChange={(date) => setForm({ ...form, date })}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Chọn ngày (dd/MM/yyyy)"
                  className={inputStyle(form.date)}
                  minDate={new Date()}
                  required
                />
              </div>
            </div>

            {/* Khung giờ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Khung thời gian thăm khám
              </label>
              <select
                name="timeSlot"
                value={form.timeSlot}
                onChange={handleChange}
                className={inputStyle(form.timeSlot)}
              >
                <option value="">Chọn khung giờ</option>
                <option>08:00 - 10:00</option>
                <option>10:00 - 12:00</option>
                <option>13:00 - 15:00</option>
                <option>15:00 - 17:00</option>
              </select>
            </div>

            {/* Mô tả */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả tình trạng của thú cưng
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Mô tả ..."
                rows={3}
                className={inputStyle(form.description)}
              ></textarea>
            </div>
          </div>

          {/* Nút gửi */}
          <div className="text-center mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="bg-[linear-gradient(90deg,#14B8A6_0%,#0EA5E9_100%)] text-white font-semibold px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
            >
              Đặt lịch hẹn ngay
              <PawPrint className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.form>

        <div className="flex items-center justify-center h-full">
          <div className="inline-flex items-center mt-6 gap-3 bg-white px-6 py-3 rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.15)]">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-50">
              <Clock className="w-5 h-5 text-[#0D9488]" />
            </div>

            <span className="text-gray-800 font-medium text-sm md:text-base">
              Mở cửa Thứ Hai - Thứ Sáu, <strong>9:00 AM - 6:00 PM</strong>
            </span>
          </div>
        </div>

        {/* Modal xác nhận */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-md"
              >
                <CheckCircle2 className="w-12 h-12 text-teal-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2 text-gray-800">
                  Đặt lịch thành công 🎉
                </h3>
                <p className="text-gray-600 mb-6">
                  Cảm ơn bạn đã tin tưởng chúng tôi! Lịch hẹn của bạn sẽ được
                  xác nhận sớm nhất.
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-teal-500 text-white px-6 py-2 rounded-full font-medium hover:bg-teal-600 transition-all flex items-center gap-2 mx-auto"
                >
                  <X className="w-4 h-4" />
                  Đóng
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Booking;
