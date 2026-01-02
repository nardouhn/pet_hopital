import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { api } from "@/api/mockApi";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getServices(), api.getMedications()]).then(
      ([servicesData, medicationsData]) => {
        setServices(servicesData);
        setMedications(medicationsData);
        setLoading(false);
      }
    );
  }, []);

  const getCategoryColor = (category) => {
    const colors = {
      Examination: "bg-blue-100 text-blue-700",
      Preventive: "bg-green-100 text-green-700",
      Dental: "bg-teal-100 text-teal-700",
      Surgery: "bg-red-100 text-red-700",
      Diagnostic: "bg-purple-100 text-purple-700",
      Wellness: "bg-pink-100 text-pink-700",
      Emergency: "bg-orange-100 text-orange-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  const getTypeColor = (type) => {
    return type === "Medication"
      ? "bg-blue-100 text-blue-700"
      : "bg-green-100 text-green-700";
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-[#f8fafb] min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dịch vụ và Thuốc men
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Quản lý dịch vụ và khám và thuốc
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
          <Plus className="size-4" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Services Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Services</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all
            </button>
          </div>

          <div className="space-y-4">
            {services.slice(0, 4).map((service) => (
              <div
                key={service.id}
                className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors"
              >
                {/* Service Name and Price */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{service.name}</h3>
                  <span className="text-lg font-semibold text-gray-900">
                    ${service.price}
                  </span>
                </div>

                {/* Category and Duration */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getCategoryColor(
                      service.category
                    )}`}
                  >
                    {service.category}
                  </span>
                  <span className="text-sm text-gray-600">
                    {service.duration}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Medications & Vaccines Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Medications & Vaccines
            </h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all
            </button>
          </div>

          <div className="space-y-4">
            {medications.slice(0, 4).map((medication) => (
              <div
                key={medication.id}
                className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors"
              >
                {/* Medication Name */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-gray-900">
                    {medication.name}
                  </h3>
                </div>

                {/* Type Badge and Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getTypeColor(
                        medication.type
                      )}`}
                    >
                      {medication.type}
                    </span>
                    <span className="text-sm text-gray-600">
                      {medication.quantity} {medication.unit}
                    </span>
                    <span className="text-sm text-gray-600">
                      ${medication.pricePerUnit} /{" "}
                      {medication.unit === "tablets" ? "tablet" : "dose"}
                    </span>
                  </div>

                  {/* Expiry or Next Order Date */}
                  <div className="text-xs text-gray-500">
                    {medication.expiryDate ? (
                      <span>Exp: {medication.expiryDate}</span>
                    ) : (
                      <span>Next order: {medication.nextOrder}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}