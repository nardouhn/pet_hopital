import React from "react";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Booking from "@/components/Booking";
import Testimonials from "@/components/Testimonials";
import Feedback from "@/components/Feedback";
import Footer from "@/layouts/Footer";
import Navbar from "@/layouts/NavBar";

export default function HomePage() {
  return (
    <div className="min-h-screen font-sans text-slate-900 bg-gradient-to-b from-emerald-50 via-emerald-50 to-emerald-100">
      <Navbar />
      <main className="pt-28">
        <Hero />
        <About />
        <Services />
        <Booking />
        <Feedback />
        <Footer />
      </main>
    </div>
  );
}
