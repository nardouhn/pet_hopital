// src/components/Navbar.jsx
import { PawPrint } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [authed, setAuthed] = useState(Boolean(localStorage.getItem('token')));
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [upcoming, setUpcoming] = useState([]);

  useEffect(()=>{
    const onLogin = ()=> setAuthed(true);
    const onLogout = ()=> { setAuthed(false); setUpcomingCount(0); setUpcoming([]); };
    window.addEventListener('user:login', onLogin);
    window.addEventListener('user:logout', onLogout);

    if (authed) {
      // fetch appointments count and top items
      import('@/api/api').then(m => m.getMyAppointments()).then(r => {
        const rows = r.data || [];
        setUpcoming(rows.length);
        setUpcomingCount(rows.length);
        setUpcoming(rows.slice(0,3));
      }).catch(()=>{});
    }

    return ()=>{
      window.removeEventListener('user:login', onLogin);
      window.removeEventListener('user:logout', onLogout);
    };
  },[authed]);

  const handleLogout = async () => {
    try{
      await import('@/api/api').then(m=>m.logoutUser());
      // events handled by API
      window.location.href = '/';
    }catch(e){ console.error(e); localStorage.removeItem('token'); window.dispatchEvent(new Event('user:logout')); window.location.href = '/'; }
  };

  return (
    <header className="w-full bg-white shadow-sm fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6 border-b border-teal-100">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="bg-[linear-gradient(90deg,#14B8A6_0%,#0EA5E9_100%)] p-2 rounded-full">
            <PawPrint className="text-[#D7F5F3] w-5 h-5" />
          </div>
          <a href="/" className="font-bold text-xl text-[#0D9488]">
            Petorium Vet Clinic
          </a>
        </div>

        {/* Menu */}
        <nav className="hidden md:flex space-x-8 text-gray-600 font-medium items-center">
          <a href="/#about" className="hover:text-[#0891B2] transition-colors">
            About
          </a>
          <a
            href="#services"
            className="hover:text-[#0891B2] transition-colors"
          >
            Services
          </a>
          <a href="#book" className="hover:text-[#0891B2] transition-colors">
            Book Now
          </a>

          {authed ? (
            <div className="flex items-center gap-4">
              <a href="/profile" className="hover:text-[#0891B2] transition-colors">Profile</a>

              <div className="relative">
                <button onClick={()=>setShowDropdown(s=>!s)} className="hover:text-[#0891B2] transition-colors">My Appointments {upcomingCount>0 && (<span className="ml-1 inline-block bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{upcomingCount}</span>)}</button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded shadow p-3 z-50">
                    <div className="text-sm text-gray-600 mb-2">Upcoming</div>
                    {upcoming.length===0 ? (<div className="text-gray-500 text-sm">No upcoming appointments</div>) : (
                      upcoming.map(a => (
                        <div key={a.appointment_id} className="border-b last:border-b-0 pb-2 mb-2">
                          <div className="font-medium">{a.service}</div>
                          <div className="text-xs text-gray-500">{a.date} • {a.timeslot}</div>
                          <a href={`/appointment/${a.appointment_id}`} className="text-xs text-teal-600">Track</a>
                        </div>
                      ))
                    )}
                    <div className="mt-2 text-center">
                      <a href="/appointments/my" className="text-sm text-teal-600">View all</a>
                    </div>
                  </div>
                )}
              </div>

              <button onClick={handleLogout} className="hover:text-[#0891B2] transition-colors">Logout</button>
            </div>
          ) : (
            <a href="/signup" className="hover:text-[#0891B2] transition-colors">Login/ Sign up</a>
          )}
        </nav>
      </div>
      <div className="border-b border-[#7DE2D1]"></div>
    </header>
  );
}
