import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Plus, PawPrint } from "lucide-react";
import { getAdminPets, getPetStats } from "@/api/mockApi";

export default function PetsPage() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState("all");
  const [stats, setStats] = useState({ total: 0, dogs: 0, cats: 0, others: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [data, rawStats] = await Promise.all([getAdminPets(), getPetStats()]);
        setPets(data);

        // Normalize stats shape
        const s = rawStats?.data ?? rawStats ?? {};
        const total = Number(s.totalPets ?? s.total ?? s.totalPets ?? 0);
        const dogs = Number(s.dogs ?? s.Dog ?? s.DogCount ?? 0);
        const cats = Number(s.cats ?? s.Cat ?? s.CatCount ?? 0);
        let others = Number(s.others ?? s.Others ?? 0);
        if (!others) others = Math.max(0, total - dogs - cats);
        setStats({ total, dogs, cats, others });
      } catch (error) {
        console.error('Error fetching pets:', error);
        setPets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Use backend stats when available; fall back to client counts
  const speciesCounts = {
    all: stats.total || pets.length,
    Dog: stats.dogs || pets.filter((p) => (p.breed || p.species || '').toString().toLowerCase().includes('chó') || (p.species || '').toString().toLowerCase().includes('dog')).length,
    Cat: stats.cats || pets.filter((p) => (p.breed || p.species || '').toString().toLowerCase().includes('mèo') || (p.species || '').toString().toLowerCase().includes('cat')).length,
    Others: stats.others || Math.max(0, pets.length - (pets.filter((p) => ((p.breed||'').toString().toLowerCase().includes('chó') || (p.species||'').toString().toLowerCase().includes('dog')).length) - 0) - (pets.filter((p) => ((p.breed||'').toString().toLowerCase().includes('mèo') || (p.species||'').toString().toLowerCase().includes('cat')).length))),
  };

  // Filter pets
  const filteredPets = pets.filter((pet) => {
    const matchesSearch =
      searchQuery === "" ||
      (pet.name || '').toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pet.breed || '').toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pet.owner || '').toString().toLowerCase().includes(searchQuery.toLowerCase());

    const breed = (pet.breed || '').toString().toLowerCase();
    const speciesField = (pet.species || '').toString().toLowerCase();

    const isDog = breed.includes('chó') || speciesField.includes('dog');
    const isCat = breed.includes('mèo') || speciesField.includes('cat');

    let matchesSpecies = false;
    if (selectedSpecies === 'all') matchesSpecies = true;
    else if (selectedSpecies === 'Dog') matchesSpecies = isDog;
    else if (selectedSpecies === 'Cat') matchesSpecies = isCat;
    else if (selectedSpecies === 'Others') matchesSpecies = !isDog && !isCat;

    return matchesSearch && matchesSpecies;
  });

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

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-[#f8fafb] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý thú cưng</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý hồ sơ thú cưng của bạn
          </p>
        </div>
        
      </div>

      {/* Species Filter Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        <FilterTab
          label="Tất cả"
          count={speciesCounts.all}
          isActive={selectedSpecies === "all"}
          onClick={() => setSelectedSpecies("all")}
          icon="🐾"
        />
        <FilterTab
          label="Chó"
          count={speciesCounts.Dog}
          isActive={selectedSpecies === "Dog"}
          onClick={() => setSelectedSpecies("Dog")}
          icon="🐕"
        />
        <FilterTab
          label="Mèo"
          count={speciesCounts.Cat}
          isActive={selectedSpecies === "Cat"}
          onClick={() => setSelectedSpecies("Cat")}
          icon="🐈"
        />
        <FilterTab
          label="Khác"
          count={speciesCounts.Others}
          isActive={selectedSpecies === "Others"}
          onClick={() => setSelectedSpecies("Others")}
          icon="⚪"
        />
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pets by name, breed, or owner..."
              className="w-full bg-[#f0fff8] border border-gray-200 rounded-lg pl-11 pr-4 py-2.5 text-sm text-gray-700 placeholder:text-[#8aa3a2] focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="size-4 text-gray-600" />
            <span className="text-sm text-gray-700">Filters</span>
          </button>
        </div>
      </div>

      {/* Pets Grid */}
      {filteredPets.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16">
          <div className="flex flex-col items-center justify-center text-center">
            <PawPrint className="size-16 text-gray-300 mb-4" />
            <p className="text-gray-500">
              {searchQuery
                ? "No pets found matching your search"
                : "No pets found"}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPets.map((pet) => (
            <div
              key={pet.id}
              onClick={() => navigate(`/admin/pets/${pet.id}`)}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
            >
              {/* Pet Avatar and Name */}
              <div className="flex items-start gap-3 mb-4">
                <div className="size-12 rounded-full bg-gradient-to-br from-teal-300 to-emerald-300 flex items-center justify-center flex-shrink-0">
                  <PawPrint className="size-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {pet.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">{pet.breed}</p>
                </div>
              </div>

              {/* Pet Details */}
              <div className="space-y-2">
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Age:</span>
                  <span className="text-gray-900">{pet.age}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Owner:</span>
                  <span className="text-gray-900 truncate ml-2">
                    {pet.owner}
                  </span>
                </div>
                
              </div>

              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterTab({ label, count, isActive, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all flex-shrink-0 ${
        isActive
          ? "bg-teal-50 border-teal-500 text-teal-700"
          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{label}</span>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            isActive ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-600"
          }`}
        >
          {count}
        </span>
      </div>
    </button>
  );
}