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
import { getPetDetail } from "@/api/mockApi";

export default function PetProfilePage() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  const formatDate = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getPetDetail(parseInt(petId));
        if (!mounted) return;
        setPet(data);
      } catch (e) {
        console.error('Failed to load pet detail', e);
        if (!mounted) return;
        setError(e?.message || "Lỗi khi tải dữ liệu");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [petId]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="text-red-600">{error}</div>
          <button
            onClick={() => navigate("/admin/pets")}
            className="mt-4 text-teal-600 hover:text-teal-700"
          >
            Back to pets list
          </button>
        </div>
      </div>
    );
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

  // Note: `species` and `status` intentionally omitted per requirements

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
            {/* Species removed intentionally */}
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
            
            {/* Health status removed intentionally */}
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
                    {formatDate(pet.lastVisit)}
                  </p>
                </div>
              </div>

              {/* Current status removed intentionally */}
            </div>
          </div>
        </div>
      </div>

      
      
    </div>
  );
}