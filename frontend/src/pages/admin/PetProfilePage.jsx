import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPet } from "@/api/mockApi";

export default function PetProfilePage() {
  const { petId } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPet() {
      try {
        setLoading(true);
        const data = await getPet(petId);
        setPet(data);
      } catch (e) {
        setPet(null);
      } finally {
        setLoading(false);
      }
    }
    if (petId) fetchPet();
  }, [petId]);

  if (loading) return <div className="p-6">Loading pet...</div>;
  if (!pet) return <div className="p-6">Pet not found</div>;

  return (
    <div className="p-6 bg-[#f8fafb] min-h-screen">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">{pet.name || pet.pet_name || 'Unknown'}</h1>
        <p className="text-sm text-gray-600 mt-1">Breed: {pet.breed || pet.breed_name || '-'}</p>
        <div className="mt-4">
          <p><strong>Owner:</strong> {pet.owner ? `${pet.owner.first_name} ${pet.owner.last_name}` : (pet.owner_name || '-')}</p>
          <p><strong>Age:</strong> {pet.age || pet.years || '-'}</p>
        </div>
      </div>
    </div>
  );
}
