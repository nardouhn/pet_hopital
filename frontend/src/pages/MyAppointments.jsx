import { useEffect, useState } from 'react';
import NavBar from '@/layouts/NavBar';
import Footer from '@/layouts/Footer';

export default function MyAppointments(){
  const [appts, setAppts] = useState([]);

  const load = async ()=>{
    const r = await import('@/api/api').then(m=>m.getMyAppointments());
    setAppts(r.data || []);
  };

  useEffect(()=>{ (async ()=>{ try{ await load(); }catch(e){ console.error(e); } })(); },[]);

  const cancel = async (id) => {
    if(!confirm('Cancel this appointment?')) return;
    try{
      const r = await import('@/api/api').then(m=>m.updateAppointment(id, { status: 'cancelled' }));
      await load();
      toast.success('Appointment cancelled');
    }catch(e){ console.error(e); toast.error('Failed to cancel'); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 max-w-4xl mx-auto p-6 mt-24">
        <h1 className="text-2xl font-bold mb-4">My Appointments</h1>
        {appts.length===0 ? (<div className="text-gray-500">No appointments</div>) : (
          appts.map(a=> (
            <div key={a.appointment_id} className="border rounded p-3 mb-2 flex justify-between items-start">
              <div>
                <div className="font-medium">{a.service} • {a.date} • {a.timeslot}</div>
                <div className="text-sm">Status: <strong>{a.status}</strong></div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <a href={`/appointment/${a.appointment_id}`} className="text-teal-600 text-sm">Track</a>
                {a.status !== 'cancelled' && (<button onClick={()=>cancel(a.appointment_id)} className="text-red-500 text-sm">Cancel</button>)}
              </div>
            </div>
          ))
        )}
      </main>
      <Footer />
    </div>
  );
}