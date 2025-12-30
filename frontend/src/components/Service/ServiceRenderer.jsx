import HealthLayout from "@/layouts/service-layouts/HealthLayout";
import VaccineLayout from "@/layouts/service-layouts/VaccineLayout";
import SurgeryLayout from "@/layouts/service-layouts/SurgeryLayout";
import NeuterLayout from "@/layouts/service-layouts/NeuterLayout";
import MedtestLayout from "@/layouts/service-layouts/MedtestLayout";
import DentalLayout from "@/layouts/service-layouts/DentalLayout";
import EmergencyLayout from "@/layouts/service-layouts/EmergencyLayout";
import SpaLayout from "@/layouts/service-layouts/SpaLayout";
import HotelLayout from "@/layouts/service-layouts/HotelLayout";
import ConsultLayout from "@/layouts/service-layouts/ConsultLayout";

const ServiceRenderer = ({ service }) => {
  switch (service.layout) {
    case "health":
      return <HealthLayout service={service} />;
    case "vaccine":
      return <VaccineLayout service={service} />;
    case "surgery":
      return <SurgeryLayout service={service} />;
    case "neuter":
      return <NeuterLayout service={service} />;
    case "medtest":
      return <MedtestLayout service={service} />;
    case "dental":
      return <DentalLayout service={service} />;
    case "emergency":
      return <EmergencyLayout service={service} />;
    case "spa":
      return <SpaLayout service={service} />;
    case "hotel":
      return <HotelLayout service={service} />;
    case "consult":
      return <ConsultLayout service={service} />;
    default:
      return null;
  }
};

export default ServiceRenderer;
