// src/components/ServiceHero.jsx
import heroImg from "@/assets/image 1.png";

const ServiceHero = ({ title = "Dịch vụ của chúng tôi", service }) => {
  return (
    <section className="relative h-[280px] flex items-center justify-center bg-teal-50 overflow-hidden">
      {/* Background image */}
      <img
        src={heroImg}
        alt="Service hero"
        className="absolute inset-0 w-full h-full object-cover opacity-100"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-white/40 " />

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <h1 className="text-3xl md:text-[51px] font-bold text-gray-800 mb-2">
          {title}
        </h1>

        {service.heroSubtitle && (
          <p className="text-2xl md:text-[42px] font-bold bg-[linear-gradient(90deg,#0C615B_0%,#056498_100%)] bg-clip-text text-transparent">
            {service.heroSubtitle}
          </p>
        )}
      </div>
    </section>
  );
};

export default ServiceHero;
