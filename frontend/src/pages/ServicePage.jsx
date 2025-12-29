import { useParams, Navigate } from "react-router-dom";
import NavBar from "@/layouts/NavBar";
import Footer from "@/layouts/Footer";
import Booking from "@/components/Booking";
import Services from "@/components/Services";
import ServiceHero from "@/components/Service/ServiceHero";
import ServiceDetail from "@/components/Service/ServiceRenderer";
import { servicesData } from "@/data/servicesData";
import { useScrollToTop } from "@/utils/ScrollToTop";

const ServicePage = () => {
  const { slug } = useParams();
  const service = servicesData[slug];
  useScrollToTop();
  if (!service) return <Navigate to="/services" replace />;

  return (
    <div className="min-h-screen bg-[linear-gradient(150deg,#FFFFFF_0%,#FFFFFF_30%,#CCFFF3_75%,#B9FFEF_100%)]">
      <NavBar />

      <main className="pt-24">
        <ServiceHero service={service} />
        <ServiceDetail service={service} />
        <Booking />
        <Services />
      </main>

      <Footer />
    </div>
  );
};

export default ServicePage;
