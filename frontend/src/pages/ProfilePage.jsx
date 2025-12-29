import { useEffect, useState } from 'react';
import NavBar from '@/layouts/NavBar';
import Footer from '@/layouts/Footer';

export default function ProfilePage(){
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(()=>{ (async ()=>{ try{ const r = await import('@/api/api').then(m=>m.getProfile()); setProfile(r.data); setForm(r.data); }catch(e){ console.error(e); } })(); },[]);

  const save = async ()=>{
    try{ const r = await import('@/api/api').then(m=>m.updateProfile(form)); setProfile(r.data); setEditing(false); toast.success('Profile updated'); }catch(e){ console.error(e); toast.error('Failed to update'); }
  };

  if(!profile) return <div className="min-h-screen"><NavBar/><main className="mt-24 p-6">Loading...</main><Footer/></div>

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 max-w-3xl mx-auto p-6 mt-24">
        <h1 className="text-2xl font-bold mb-4">My Profile</h1>
        {!editing ? (
          <div>
            <div><strong>Name:</strong> {profile.firstName} {profile.lastName}</div>
            <div><strong>Email:</strong> {profile.email}</div>
            <div><strong>Phone:</strong> {profile.phone}</div>
            <button onClick={()=>setEditing(true)} className="mt-3 bg-teal-500 text-white px-3 py-1 rounded">Edit</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            <input value={form.firstName||''} onChange={(e)=>setForm({...form, firstName:e.target.value})} className="border p-2 rounded" />
            <input value={form.lastName||''} onChange={(e)=>setForm({...form, lastName:e.target.value})} className="border p-2 rounded" />
            <input value={form.email||''} onChange={(e)=>setForm({...form, email:e.target.value})} className="border p-2 rounded" />
            <input value={form.phone||''} onChange={(e)=>setForm({...form, phone:e.target.value})} className="border p-2 rounded" />
            <button onClick={save} className="mt-3 bg-teal-500 text-white px-3 py-1 rounded">Save</button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}