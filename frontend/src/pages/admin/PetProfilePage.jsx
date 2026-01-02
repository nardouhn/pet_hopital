import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  Stethoscope,
  Calendar,
  PawPrint,
} from "lucide-react";
import { api } from "@/api/mockApi";

export default function PetProfilePage() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    api.getPetById(parseInt(petId)).then((data) => {
      setPet(data);
      setLoading(false);
    });
  }, [petId]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!pet) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16">
          <div className="flex flex-col items-center justify-center text-center">
            <PawPrint className="size-16 text-gray-300 mb-4" />
            <p className="text-gray-500">Pet not found</p>
            <button
              onClick={() => navigate("/admin/pets")}
              className="mt-4 text-teal-600 hover:text-teal-700"
            >
              Back to pets list
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Healthy":
        return "bg-green-100 text-green-700";
      case "Unhealthy":
        return "bg-red-100 text-red-700";
      case "Warning":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[#f8fafb] min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => navigate("/admin/pets")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="size-4" />
        <span className="text-sm">Back to pets list</span>
      </button>

      {/* Pet Name */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pet Profile Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pet Profile
          </h2>

          {/* Pet Avatar */}
          <div className="flex justify-center mb-6">
            <div className="size-24 rounded-full bg-gradient-to-br from-teal-300 to-emerald-300 flex items-center justify-center">
              <PawPrint className="size-12 text-white" />
            </div>
          </div>

          {/* Pet Details */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Name</label>
              <p className="text-base font-medium text-gray-900 mt-1">
                {pet.name}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Species</label>
              <p className="text-base font-medium text-gray-900 mt-1">
                {pet.species}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Breed</label>
              <p className="text-base font-medium text-gray-900 mt-1">
                {pet.breed}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Age</label>
              <p className="text-base font-medium text-gray-900 mt-1">
                {pet.age}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Gender</label>
              <p className="text-base font-medium text-gray-900 mt-1">
                {pet.gender}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Health Status</label>
              <div className="mt-1">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    pet.status
                  )}`}
                >
                  {pet.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Owner Information & Medical Information */}
        <div className="space-y-6">
          {/* Owner Information Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Owner Information
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <User className="size-5 text-gray-600" />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Owner Name</label>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {pet.owner}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Phone className="size-5 text-gray-600" />
                </div>
                <div>
                  <label className="text-sm text-gray-500">
                    Contact Information
                  </label>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {pet.ownerContact}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Medical Information
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Stethoscope className="size-5 text-gray-600" />
                </div>
                <div>
                  <label className="text-sm text-gray-500">
                    Assigned Doctor
                  </label>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {pet.assignedDoctor}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Calendar className="size-5 text-gray-600" />
                </div>
                <div>
                  <label className="text-sm text-gray-500">
                    Last Visit Date
                  </label>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {pet.lastVisit}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Stethoscope className="size-5 text-gray-600" />
                </div>
                <div>
                  <label className="text-sm text-gray-500">
                    Current Status
                  </label>
                  <div className="mt-1">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        pet.status
                      )}`}
                    >
                      {pet.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tab Headers */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "overview"
                  ? "border-teal-500 text-teal-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("medical-history")}
              className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "medical-history"
                  ? "border-teal-500 text-teal-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Medical History
            </button>
            <button
              onClick={() => setActiveTab("vaccination")}
              className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "vaccination"
                  ? "border-teal-500 text-teal-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Vaccination
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Pet Name</label>
                  <p className="text-base text-gray-900 mt-1">{pet.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Species</label>
                  <p className="text-base text-gray-900 mt-1">{pet.species}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Breed</label>
                  <p className="text-base text-gray-900 mt-1">{pet.breed}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Age</label>
                  <p className="text-base text-gray-900 mt-1">{pet.age}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Owner</label>
                  <p className="text-base text-gray-900 mt-1">{pet.owner}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Health Status</label>
                  <div className="mt-1">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        pet.status
                      )}`}
                    >
                      {pet.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "medical-history" && (
            <div className="text-center py-12">
              <p className="text-gray-500">No medical history available yet.</p>
            </div>
          )}

          {activeTab === "vaccination" && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No vaccination records available yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}