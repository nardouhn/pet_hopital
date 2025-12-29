import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Star } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const Feedback = () => {
  const [form, setForm] = useState({ name: "", email: "", feedback: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.feedback) {
      toast.error("❗Vui lòng điền đầy đủ thông tin!", {
        position: "top-right",
      });
      return;
    }

    toast.success("✅ Gửi feedback thành công!", { position: "top-right" });
    setForm({ name: "", email: "", feedback: "" });
  };

  const reviews = [
    {
      name: "Trang Lê",
      pet: "Max (Chó Poodle)",
      text: "Bác sĩ ở đây siêu dễ thương luôn! Bé chó nhà mình đi khám mà cứ vẫy đuôi suốt. Dịch vụ tận tâm, chỗ sạch sẽ nữa!",
    },
    {
      name: "Hải Đăng",
      pet: "Luna (Mèo Anh lông dài)",
      text: "Phòng khám cực kỳ chuyên nghiệp, bác sĩ nhẹ nhàng và giải thích rõ ràng. Mình yên tâm 100% khi đưa bé mèo tới đây.",
    },
    {
      name: "Tú Anh",
      pet: "Đen (Chó cỏ)",
      text: "Thật sự biết ơn vì đã cứu bé cún của mình hôm đó. Ai nuôi pet mà cần chỗ uy tín thì tới đây liền nha!",
    },
  ];

  return (
    <section className="bg-gradient-to-b from-white to-teal-50 py-20 px-6">
      <Toaster /> {/* Hiển thị toast */}
      <div className="max-w-6xl mx-auto text-center">
        {/* PHẦN REVIEW */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex justify-center mb-4">
            <span className="bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full font-semibold text-sm flex items-center gap-2">
              <Star className="w-4 h-4" /> 5-Star Reviews
            </span>
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-2">
            Đánh giá về chúng tôi
          </h2>
          <p className="text-gray-600">
            Câu chuyện thật từ những người tin tưởng Petorium
          </p>
        </motion.div>

        {/* DANH SÁCH REVIEW */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {reviews.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl shadow-md p-6 text-left border border-gray-100 hover:shadow-xl transition-all"
            >
              <div className="flex mb-3">
                {[...Array(5)].map((_, idx) => (
                  <Star
                    key={idx}
                    className="w-5 h-5 text-yellow-400"
                    fill="gold"
                  />
                ))}
              </div>
              <p className="text-gray-700 italic mb-6">{`"${item.text}"`}</p>
              <div className="flex items-center gap-3">
                <div className="bg-cyan-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center uppercase">
                  {item.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.pet}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FORM GỬI FEEDBACK */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="flex justify-center mb-4">
            <span className="bg-pink-100 text-pink-700 px-4 py-1 rounded-full font-semibold text-sm flex items-center gap-2">
              <Heart className="w-4 h-4" /> Hãy để lại feedback tại đây nhé!
            </span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Chia sẻ trải nghiệm của bạn
          </h2>
          <p className="text-gray-600 mb-10">
            Trải nghiệm của bạn sẽ giúp cải thiện dịch vụ của chúng tôi!
          </p>

          <form
            onSubmit={handleSubmit}
            className="bg-white max-w-3xl mx-auto p-8 rounded-3xl shadow-lg border border-blue-100"
          >
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Feedback *
              </label>
              <textarea
                name="feedback"
                value={form.feedback}
                onChange={handleChange}
                placeholder="Share your experience or suggestions..."
                rows={4}
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              ></textarea>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="bg-gradient-to-r from-cyan-400 to-teal-400 text-white font-semibold px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mx-auto"
            >
              Submit Feedback <Heart className="w-5 h-5" />
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default Feedback;
