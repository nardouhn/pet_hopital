import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "aos/dist/aos.css";
import AOS from "aos";
import "react-datepicker/dist/react-datepicker.css";

// Khởi tạo AOS
AOS.init();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
