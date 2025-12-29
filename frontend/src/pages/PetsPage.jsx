import { useEffect, useState } from 'react';
import NavBar from '@/layouts/NavBar';
import Footer from '@/layouts/Footer';

export default function PetsPage(){
  const [pets, setPets] = useState([]);
  const [form, setForm] = useState({name:'', breed:'', gender:'unknown', age:'', weight:'', color:''});
  const [loading, setLoading] = useState(false);

  const load = async ()=>{
    try{
      const { data } = await import('@/api/api').then(m=>m.getPets());
      setPets(data || []);
    }catch(e){
      console.error(e);
      setPets([]);
    }
  };

  useEffect(()=>{ load(); },[]);

  const handleCreate = async ()=>{
    setLoading(true);
    try{
      await import('@/api/api').then(m=>m.createPet(form));
      setForm({name:'', breed:'', gender:'unknown', age:'', weight:'', color:''});
      await load();
    }catch(e){ console.error(e); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 max-w-4xl mx-auto p-6 mt-24">
        <h1 className="text-2xl font-bold mb-4">My Pets</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {pets.length === 0 ? (
            <div className="col-span-2">
              <div className="text-gray-500 text-center">You have no pets yet. Add one below.</div>
            </div>
          ) : (
            pets.map(p => (
              <div key={p.pet_id} className="p-4 rounded-lg border bg-white shadow-sm"> 
                <div className="font-semibold text-lg">{p.name}</div>
                <div className="text-sm text-gray-600">{p.breed} • {p.gender} • Age: {p.age}</div>
                <div className="mt-2 flex items-center gap-2">
                  <a className="text-teal-600 text-sm" href={`/pets/${p.pet_id}`}>View</a>
                  <button onClick={async()=>{ if(confirm('Delete pet?')){ try{ await import('@/api/api').then(m=>m.deletePet(p.pet_id)); await load(); }catch(e){ console.error(e); } }} } className="text-sm text-red-500">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 rounded-lg border">
          <h2 className="font-semibold mb-2">Add new pet</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input placeholder="Name" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} className="border p-2 rounded" />
            <input placeholder="Breed" value={form.breed} onChange={(e)=>setForm({...form, breed:e.target.value})} className="border p-2 rounded" />
            <input placeholder="Gender" value={form.gender} onChange={(e)=>setForm({...form, gender:e.target.value})} className="border p-2 rounded" />
            <input placeholder="Age" value={form.age} onChange={(e)=>setForm({...form, age:e.target.value})} className="border p-2 rounded" />
            <input placeholder="Weight" value={form.weight} onChange={(e)=>setForm({...form, weight:e.target.value})} className="border p-2 rounded" />
            <input placeholder="Color" value={form.color} onChange={(e)=>setForm({...form, color:e.target.value})} className="border p-2 rounded" />
          </div>
          <button onClick={handleCreate} disabled={loading} className="mt-3 bg-teal-500 text-white px-4 py-2 rounded">{loading? 'Adding...' : 'Add Pet'}</button>
        </div>

      </main>
      <Footer />
    </div>
  );
}