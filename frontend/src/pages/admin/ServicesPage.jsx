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
    if (!type) return "bg-gray-100 text-gray-700";
    const t = String(type).toLowerCase();
    if (t.includes('vaccine') || t.includes('vacxin') || t.includes('vac')) {
      return "bg-pink-100 text-pink-700";
    }
    return t === "medication" || t === "medic" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700";
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-[#f8fafb] min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dịch vụ và Thuốc men</h1>
          <p className="text-sm text-gray-600 mt-1">Quản lý dịch vụ và khám và thuốc</p>
        </div>
        
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Services Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Services</h2>
            <span className="text-sm text-gray-500">{services.length} items</span>
          </div>

          <div className="overflow-y-auto flex-1 p-6">
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-teal-300 hover:bg-teal-50 transition-all cursor-pointer"
                >
                  <h3 className="font-medium text-gray-900">{service.name}</h3>
                  <span className="font-semibold text-teal-600">{service.price}đ</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Medications & Vaccines Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Medications & Vaccines</h2>
            <span className="text-sm text-gray-500">{medications.length} items</span>
          </div>

          <div className="overflow-y-auto flex-1 p-6">
            <div className="space-y-3">
              {medications.map((medication) => (
                <div
                  key={medication.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                >
                  <h3 className="font-medium text-gray-900">{medication.name}</h3>
                  <span className="font-semibold text-blue-600">{medication.pricePerUnit}đ</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}