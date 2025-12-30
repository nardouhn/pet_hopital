import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Star } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { getReviews, submitFeedback } from "@/api/mockApi";

import imgCat from "@/assets/image 10.png";
import imgDog from "@/assets/Rectangle 4.png";

const Feedback = () => {
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({
    name: "",
    petName: "",
    breed: "",
    feedback: "",
    rating: 5,
  });

  useEffect(() => {
    getReviews().then(setReviews);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.petName || !form.breed || !form.feedback) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    await submitFeedback(form);
    toast.success("Gửi feedback thành công!");

    setForm({
      name: "",
      petName: "",
      breed: "",
      feedback: "",
      rating: 5,
    });
  };

  const inputStyle = (value) =>
    `w-full rounded-lg px-4 py-2 border transition-all duration-200
   ${value ? "bg-[#CCFBF1]/70 border-teal-300" : "bg-white/70 border-gray-200"}
   focus:outline-none focus:ring-2 focus:ring-teal-300`;

  return (
    <section className="relative py-24 bg-gradient-to-br from-[#F0FAF9] to-[#E6FFFA] overflow-hidden">
      <Toaster />

      {/* ẢNH TRANG TRÍ */}
      <img
        src={imgCat}
        alt="cat"
        className="hidden lg:block absolute right-0 top-20 w-72 opacity-90 scale-140 mt-100"
      />

      <div className="max-w-6xl mx-auto px-6 text-center">
        {/* ===== REVIEW HEADER ===== */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full font-semibold text-sm">
            <Star className="w-4 h-4" /> 5-Star Reviews
          </span>
          <h2 className="text-4xl font-bold text-gray-800 mt-4 mb-2">
            Đánh giá về chúng tôi
          </h2>
          <p className="text-gray-600">
            Câu chuyện thật từ những người tin tưởng Petorium
          </p>
        </motion.div>

        {/* ===== REVIEW LIST ===== */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {reviews.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-6 text-left shadow-lg hover:shadow-xl transition"
            >
              <div className="flex mb-3">
                {[...Array(item.rating)].map((_, idx) => (
                  <Star
                    key={idx}
                    className="w-5 h-5 text-yellow-400"
                    fill="gold"
                  />
                ))}
              </div>

              <p className="text-gray-700 italic mb-6">“{item.content}”</p>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-cyan-500 text-white font-bold flex items-center justify-center">
                  {item.name[0]}
                </div>
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.pet}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ===== FEEDBACK FORM ===== */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex bg-white/70 backdrop-blur-xl items-center gap-2 bg-pink-100 text-pink-700 px-4 py-1 rounded-full font-semibold text-sm mb-4">
            <Heart className="w-4 h-4" /> Hãy để lại feedback tại đây nhé!
          </span>

          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Chia sẻ trải nghiệm của bạn
          </h2>
          <p className="text-gray-600 mb-10">
            Trải nghiệm của bạn giúp chúng tôi cải thiện dịch vụ!
          </p>

          <form
            onSubmit={handleSubmit}
            className="relative overflow-hidden bg-white/70 backdrop-blur-xl max-w-3xl mx-auto p-10 rounded-3xl shadow-xl "
          >
            {/* Background image */}
            <img
              src={imgDog}
              alt="dog"
              className="pointer-events-none absolute inset-0 mx-auto  opacity-50"
            />

            {/* Content */}
            <div className="relative z-10">
              {/* Row 1 */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="label">Your Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className={inputStyle(form.name)}
                  />
                </div>

                <div>
                  <label className="label">Pet’s Name *</label>
                  <input
                    name="petName"
                    value={form.petName}
                    onChange={handleChange}
                    placeholder="Pet’s name"
                    className={inputStyle(form.petName)}
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid md:grid-cols-2 gap-6 mb-6 items-end">
                <div>
                  <label className="label">Breed *</label>
                  <input
                    name="breed"
                    value={form.breed}
                    onChange={handleChange}
                    placeholder="Dog, Cat..."
                    className={inputStyle(form.breed)}
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="label">Rating:</label>
                  <div className="flex gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        onClick={() => setForm({ ...form, rating: star })}
                        className={`w-6 h-6 cursor-pointer transition ${
                          star <= form.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        fill={star <= form.rating ? "gold" : "none"}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <div className="mb-8">
                <label className="label">Your Feedback *</label>
                <textarea
                  name="feedback"
                  value={form.feedback}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Share your experience or suggestions..."
                  className={inputStyle(form.feedback)}
                />
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="w-full bg-gradient-to-r from-sky-500 to-teal-500 text-white font-semibold py-4 rounded-full shadow-lg flex items-center justify-center gap-2"
              >
                Submit Feedback <Heart className="w-5 h-5" />
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default Feedback;
