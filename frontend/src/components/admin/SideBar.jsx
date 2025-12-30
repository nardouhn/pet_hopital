import svgPaths from "@/assets/svg-su125a0l2d";
import { useNavigate, useLocation } from "react-router-dom";
export default function SideBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: "overview",
      label: "Tổng quan",
      icon: "grid",
      path: "/admin/overview",
    },
    { id: "users", label: "Người dùng", icon: "users", path: "/admin/users" },
    { id: "doctors", label: "Bác sĩ", icon: "doctor", path: "/admin/doctors" },
    { id: "pets", label: "Thú cưng", icon: "pets", path: "/admin/pets" },
    {
      id: "appointments",
      label: "Lịch hẹn",
      icon: "calendar",
      path: "/admin/appointments",
    },
    { id: "visits", label: "Lượt khám", icon: "exam", path: "/admin/visits" },
    {
      id: "records",
      label: "Hồ sơ bệnh án",
      icon: "records",
      path: "/admin/records",
    },
    {
      id: "services",
      label: "Dịch vụ",
      icon: "services",
      path: "/admin/services",
    },
    {
      id: "invoices",
      label: "Hóa đơn",
      icon: "invoice",
      path: "/admin/invoices",
    },
    {
      id: "hotel",
      label: "Khách sạn thú cưng",
      icon: "hotel",
      path: "/admin/hotel",
    },
    {
      id: "statistics",
      label: "Thống kê",
      icon: "chart",
      path: "/admin/statistics",
    },
    {
      id: "feedback",
      label: "Feedback",
      icon: "feedback",
      path: "/admin/feedback",
    },
  ];

  const handleItemClick = (path) => {
    navigate(path);
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const getButtonClass = (path) => {
    if (isActive(path)) {
      return "bg-gradient-to-r from-[#a4eaf2] to-[#bff6e6] shadow-[0px_3px_4.5px_-0.75px_rgba(0,0,0,0.1)]";
    }
    return "hover:bg-gray-50";
  };

  const getIconStroke = (path) => (isActive(path) ? "#1F2937" : "#4B5563");
  const getTextWeight = (path) =>
    isActive(path) ? "font-bold" : "font-normal";
  const getTextColor = (path) =>
    isActive(path) ? "text-gray-900" : "text-gray-600";

  return (
    <div className="bg-white flex flex-col relative shadow-[0px_15px_18.75px_-3.75px_rgba(0,0,0,0.1)] size-full">
      {/* Header */}
      <div
        className="relative shrink-0 w-full"
        style={{
          backgroundImage:
            "linear-gradient(159.444deg, rgb(164, 234, 242) 0%, rgb(191, 246, 230) 100%)",
        }}
      >
        <div className="flex items-center gap-2 p-4">
          <div className="bg-white rounded-full shadow-md size-9 flex items-center justify-center flex-shrink-0">
            <svg className="size-5" fill="none" viewBox="0 0 21 21">
              <path
                d={svgPaths.p35e4af70}
                fill="#A4EAF2"
                stroke="#A4EAF2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.75"
              />
            </svg>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">
              Petorium
            </p>
            <p className="text-gray-600 text-xs">Vet Clinic Admin</p>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-1.5">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.path)}
              className={`${getButtonClass(
                item.path
              )} flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer w-full`}
            >
              <MenuIcon icon={item.icon} isActive={isActive(item.path)} />
              <span
                className={`${getTextWeight(item.path)} ${getTextColor(
                  item.path
                )} text-xs`}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-3 left-4 right-2">
        <div
          className="rounded-xl p-3"
          style={{
            backgroundImage:
              "linear-gradient(158.453deg, rgb(252, 231, 243) 0%, rgb(191, 246, 230) 100%)",
          }}
        >
          <svg className="size-6 mb-1" fill="none" viewBox="0 0 24 24">
            <path
              d={svgPaths.p1ef66a00}
              stroke="#A4EAF2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <path
              d={svgPaths.p3456ad00}
              stroke="#A4EAF2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <path
              d={svgPaths.pf090b40}
              stroke="#A4EAF2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <path
              d={svgPaths.p34e05f00}
              stroke="#A4EAF2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
          <p className="text-gray-700 text-xs">Caring for pets with love</p>
        </div>
      </div>
    </div>
  );
}

function MenuIcon({ icon, isActive }) {
  const stroke = isActive ? "#1F2937" : "#4B5563";
  const strokeWidth = isActive ? "1.5625" : "1.25";

  return (
    <div className="size-4 flex-shrink-0">
      <svg className="size-full" fill="none" viewBox="0 0 15 15">
        {icon === "grid" && (
          <g>
            <path
              d={svgPaths.p23f79800}
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={strokeWidth}
            />
            <path
              d={svgPaths.p2c56bcf2}
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={strokeWidth}
            />
            <path
              d={svgPaths.p2f9ab500}
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={strokeWidth}
            />
            <path
              d={svgPaths.p4a95400}
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={strokeWidth}
            />
          </g>
        )}
        {icon === "users" && (
          <g>
            <path
              d={svgPaths.p33bf3b80}
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
            <path
              d={svgPaths.p2f4e1950}
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
            <path
              d={svgPaths.p26ef60c0}
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
            <path
              d={svgPaths.pe6a3980}
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
          </g>
        )}
        {icon === "doctor" && (
          <g>
            <path
              d={svgPaths.p3d3dbe00}
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
            <path
              d={svgPaths.p27ddbc00}
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
            <path
              d={svgPaths.pf908c00}
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
          </g>
        )}
        {icon === "pets" && (
          <g>
            <path
              d={svgPaths.p2be79af2}
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
            <path
              d={svgPaths.p3c086c00}
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
            <path
              d={svgPaths.p10978580}
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
            <path
              d={svgPaths.paf15900}
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
          </g>
        )}
        {icon === "calendar" && (
          <g>
            <path
              d="M5.00002 1.24999V3.74999"
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
            <path
              d="M9.99998 1.24999V3.74999"
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
            <path
              d={svgPaths.p3d655180}
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
            <path
              d="M1.875 6.25H13.125"
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
          </g>
        )}
        {icon === "exam" && (
          <g opacity="0.8">
            <path d={svgPaths.p32055b40} fill={stroke} />
          </g>
        )}
        {icon === "records" && (
          <g>
            <path
              d={svgPaths.p20e26c00}
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
            <path
              d={svgPaths.pbbfc200}
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
            <path
              d="M7.5 6.87499H10"
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
            <path
              d="M7.5 9.99999H10"
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
            <path
              d="M5.00002 6.87499H5.00627"
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
            <path
              d="M5.00002 9.99999H5.00627"
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
          </g>
        )}
        {icon === "services" && (
          <g>
            <path
              d={svgPaths.pefd3500}
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
            <path
              d={svgPaths.p10065b80}
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
          </g>
        )}
        {icon === "invoice" && (
          <g>
            <path
              d={svgPaths.p3bc7a040}
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
            <path
              d={svgPaths.p33adf980}
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
            <path
              d="M6.25002 5.62501H5.00002"
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
            <path
              d="M10 8.12501H5.00002"
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
            <path
              d="M10 10.625H5.00002"
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
          </g>
        )}
        {icon === "hotel" && (
          <g>
            <path
              d={svgPaths.p9cf97c0}
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
            <path
              d="M5.625 13.75V7.5H9.375V13.75"
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
          </g>
        )}
        {icon === "chart" && (
          <g>
            <path
              d="M1.875 1.875V13.125H13.125"
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
            <path
              d="M11.25 10.625V5.625"
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
            <path
              d="M8.12498 10.625V3.12502"
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
            <path
              d="M5.00002 10.625V8.75002"
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
          </g>
        )}
        {icon === "feedback" && (
          <g>
            <path
              d={svgPaths.p2d7c2b00}
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="0.5"
            />
            <path
              d={svgPaths.pfa3e580}
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="0.5"
            />
          </g>
        )}
      </svg>
    </div>
  );
}
