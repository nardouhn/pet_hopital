import React from "react";
import { motion } from "framer-motion";
import { Heart, PawPrint } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-teal-800 via-blue-800 to-teal-900 text-white py-10 mt-16 rounded-t-3xl">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-5xl mx-auto text-center px-6"
      >
        {/* LOGO + SLOGAN */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-white p-2 rounded-full">
              <PawPrint className="text-teal-600 w-6 h-6" />
            </div>
            <h2 className="text-2xl font-semibold">Petorium Vet Clinic</h2>
          </div>
          <p className="text-cyan-100 font-medium">
            Nhiệt huyết và tận tâm – Ngôi nhà thứ hai của thú cưng bạn
          </p>
        </div>

        {/* LINKS */}
        <div className="flex justify-center items-center gap-10 text-sm font-medium mb-6">
          <a
            href="#about"
            className="hover:text-cyan-300 transition-all duration-200"
          >
            About Us
          </a>
          <span className="text-cyan-300">•</span>
          <a
            href="#services"
            className="hover:text-cyan-300 transition-all duration-200"
          >
            Services
          </a>
          <span className="text-cyan-300">•</span>
          <a
            href="#book"
            className="hover:text-cyan-300 transition-all duration-200"
          >
            Book Now
          </a>
        </div>

        {/* LINE */}
        <div className="border-t border-cyan-500/40 w-2/3 mx-auto mb-4"></div>

        {/* COPYRIGHT */}
        <p className="text-cyan-200 text-sm">
          © 2025 Petorium Vet Clinic. All rights reserved. Made with{" "}
          <Heart className="inline-block w-4 h-4 text-cyan-300 mx-1" /> for pets
          and their families.
        </p>
      </motion.div>
    </footer>
  );
};

export default Footer;
