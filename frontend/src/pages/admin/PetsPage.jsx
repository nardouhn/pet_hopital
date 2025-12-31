// src/pages/admin/PetsPage.jsx
import { useEffect, useState } from "react";
import { getAdminPets } from "@/api/mockApi";

export default function PetsPage() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetch() {
      setLoading(true);
      const data = await getAdminPets();
      if (mounted) setPets(data);
      setLoading(false);
    }
    fetch();
    return () => (mounted = false);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Thú cưng</h1>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="bg-white rounded-xl shadow border">
          <table className="w-full text-left">
            <thead className="bg-sky-50">
              <tr>
                <th className="px-6 py-3">Tên</th>
                <th className="px-6 py-3">Loại</th>
                <th className="px-6 py-3">Chủ</th>
              </tr>
            </thead>
            <tbody>
              {pets.map((p) => (
                <tr key={p.pet_id} className="border-t hover:bg-sky-50">
                  <td className="px-6 py-4 font-medium">{p.name}</td>
                  <td className="px-6 py-4">{p.breed || '-'}</td>
                  <td className="px-6 py-4">{p.owner ? `${p.owner.first_name} ${p.owner.last_name}` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
