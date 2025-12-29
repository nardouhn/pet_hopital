import { useEffect, useState } from 'react';
import NavBar from '@/layouts/NavBar';
import Footer from '@/layouts/Footer';
import { useParams } from 'react-router-dom';

export default function PetDetail(){
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [records, setRecords] = useState([]);

  useEffect(()=>{ (async ()=>{ try{
    const r = await import('@/api/api').then(m=>m.getPet(id));
    setPet(r.data);
    const rec = await import('@/api/api').then(m=>m.getPetMedicalRecords(id));
    setRecords(rec.data || []);
  }catch(e){ console.error(e); } })();},[id]);

  const handleDelete = async ()=>{
    if(!confirm('Delete this pet?')) return;
    try{ await import('@/api/api').then(m=>m.deletePet(id)); toast.success('Pet deleted'); window.location.href='/pets'; }catch(e){ console.error(e); toast.error('Failed to delete'); }
  };

  if(!pet) return <div className="min-h-screen"><NavBar/><main className="mt-24 p-6">Loading...</main><Footer/></div>

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 max-w-3xl mx-auto p-6 mt-24">
        <h1 className="text-2xl font-bold mb-2">{pet.name}</h1>
        <div className="text-sm text-gray-600 mb-4">{pet.breed} • {pet.gender}</div>

        <section className="mt-6">
          <h2 className="font-semibold mb-2">Medical Records</h2>
          {records.length===0 && <div className="text-gray-500">No records</div>}
          {records.map(r=> (
            <div key={r.report_id} className="border rounded p-3 mb-2">
              <div className="font-medium">Status: {r.status}</div>
              <div>Services: {r.services}</div>
              <div>Medication: {r.medication}</div>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}