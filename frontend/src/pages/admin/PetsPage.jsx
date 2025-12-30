// src/pages/admin/PetsPage.jsx
const pets = [
  { id: 1, name: "Milo", type: "Chó", owner: "Nguyễn Văn A" },
  { id: 2, name: "Luna", type: "Mèo", owner: "Lê Thị B" },
];

export default function PetsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Thú cưng</h1>

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
              <tr key={p.id} className="border-t hover:bg-sky-50">
                <td className="px-6 py-4 font-medium">{p.name}</td>
                <td className="px-6 py-4">{p.type}</td>
                <td className="px-6 py-4">{p.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
