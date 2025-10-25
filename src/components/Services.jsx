import React from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Syringe,
  Scissors,
  FlaskConical,
  Stethoscope,
  Hospital,
  Ambulance,
  Sparkles,
  Pill,
} from "lucide-react";

const services = [
  {
    icon: <Stethoscope className="w-6 h-6 text-white" />,
    bg: "bg-teal-500",
    title: "Khám sức khỏe",
    desc: "Khám định kỳ giúp thú cưng của bạn luôn khỏe mạnh và hạnh phúc.",
  },
  {
    icon: <Syringe className="w-6 h-6 text-white" />,
    bg: "bg-sky-500",
    title: "Tiêm ngừa",
    desc: "Chương trình tiêm phòng toàn diện cho tất cả thú cưng.",
  },
  {
    icon: <Pill className="w-6 h-6 text-white" />,
    bg: "bg-violet-500",
    title: "Phẫu thuật",
    desc: "Thực hiện các ca phẫu thuật hiện đại với trang thiết bị tiên tiến.",
  },
  {
    icon: <Scissors className="w-6 h-6 text-white" />,
    bg: "bg-yellow-400",
    title: "Triệt sản",
    desc: "Dịch vụ triệt sản an toàn, giúp thú cưng khỏe mạnh và ngăn ngừa bệnh lý sinh sản.",
  },
  {
    icon: <FlaskConical className="w-6 h-6 text-white" />,
    bg: "bg-cyan-400",
    title: "Xét nghiệm",
    desc: "Thực hiện các xét nghiệm nhanh, chính xác để chẩn đoán và theo dõi sức khỏe thú cưng.",
  },
  {
    icon: <FlaskConical className="w-6 h-6 text-white" />,
    bg: "bg-pink-500",
    title: "Chăm sóc răng miệng",
    desc: "Dịch vụ chăm sóc và vệ sinh răng miệng toàn diện.",
  },
  {
    icon: <Ambulance className="w-6 h-6 text-white" />,
    bg: "bg-red-500",
    title: "Cấp cứu",
    desc: "Dịch vụ cấp cứu 24/7 cho các tình huống khẩn cấp.",
  },
  {
    icon: <Sparkles className="w-6 h-6 text-white" />,
    bg: "bg-orange-400",
    title: "Chăm sóc & Spa",
    desc: "Dịch vụ spa và làm đẹp chuyên nghiệp cho thú cưng.",
  },
  {
    icon: <Hospital className="w-6 h-6 text-white" />,
    bg: "bg-green-400",
    title: "Hotel thú cưng",
    desc: "Nơi lưu trú tiện nghi, an toàn và thân thiện cho thú cưng khi bạn vắng nhà.",
  },
  {
    icon: <Heart className="w-6 h-6 text-white" />,
    bg: "bg-indigo-500",
    title: "Tư vấn và điều trị",
    desc: "Cung cấp tư vấn và điều trị chuyên sâu giúp thú cưng phục hồi và duy trì sức khỏe tốt nhất.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const Services = () => {
  return (
    <section id="services" className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="inline-block bg-blue-50 text-blue-600 font-medium px-4 py-1 rounded-full mb-4"
        >
          🩺 Những gì chúng tôi cung cấp
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-gray-800 mb-3"
        >
          Dịch vụ của chúng tôi
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-gray-600 mb-12"
        >
          Chăm sóc toàn diện cho mọi giai đoạn trong cuộc sống của thú cưng của
          bạn
        </motion.p>

        {/* Grid of services */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {services.map((service, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 text-left cursor-pointer"
            >
              <div
                className={`${service.bg} w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-inner`}
              >
                {service.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {service.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {service.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
