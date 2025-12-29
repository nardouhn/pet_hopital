import { PawPrint, User, LogOut, Calendar } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const auth = JSON.parse(localStorage.getItem("auth"));

  const isUser = auth?.isAuthenticated && auth.role === "user";

  function handleLogout() {
    localStorage.removeItem("auth");
    setOpen(false);
    navigate("/");
  }

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full bg-white shadow-sm fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6 border-b border-teal-100">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-[linear-gradient(90deg,#14B8A6_0%,#0EA5E9_100%)] p-2 rounded-full">
            <PawPrint className="text-[#D7F5F3] w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-[#0D9488]">
            Petorium Vet Clinic
          </span>
        </Link>

        {/* Menu */}
        <nav className="hidden md:flex items-center space-x-8 text-gray-600 font-medium">
          <a href="/#about" className="hover:text-[#0891B2]">
            About
          </a>
          <a href="/#services" className="hover:text-[#0891B2]">
            Services
          </a>
          <a href="/#book" className="hover:text-[#0891B2]">
            Book Now
          </a>

          {/* ❌ Chưa đăng nhập */}
          {!auth && (
            <Link
              to="/login"
              className="hover:text-[#0891B2] transition-colors"
            >
              Login / Sign up
            </Link>
          )}

          {/* ✅ User đăng nhập */}
          {isUser && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-100 text-teal-700 hover:bg-teal-200"
              >
                <User className="w-5 h-5" />
              </button>

              {open && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-teal-100 overflow-hidden">
                  {/* User info */}
                  <div className="px-4 py-3 bg-teal-50 border-b">
                    <p className="text-sm font-semibold text-gray-800">
                      {auth.user.name}
                    </p>
                    <p className="text-xs text-gray-500">{auth.user.email}</p>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/appointments");
                    }}
                    className="w-full px-4 py-2 flex items-center gap-3 text-sm hover:bg-teal-50"
                  >
                    <Calendar className="w-4 h-4 text-teal-600" />
                    Tra cứu lịch hẹn
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 flex items-center gap-3 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
