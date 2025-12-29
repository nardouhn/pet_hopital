import { useEffect, useState } from 'react';

export default function ServiceSelect({value, onChange}){
  const [services, setServices] = useState([]);
  useEffect(()=>{ (async ()=>{ try{ const r = await import('@/api/api').then(m=>m.getServices()); setServices(r.data || []);}catch(e){console.error(e);} })(); },[]);
  return (
    <select value={value} onChange={(e)=>onChange(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-white focus:outline-none">
      <option value="">-- Select service --</option>
      {services.map(s=> (<option key={s.service_id} value={s.name}>{s.name} — {s.price}</option>))}
    </select>
  );
}