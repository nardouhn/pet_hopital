import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import ScrollToHash from "@/utils/ScrollToHash";
import AppRoutes from "@/routes/routes";

export default function App() {
  return (
    <>
      <Toaster richColors />
      <BrowserRouter>
        <ScrollToHash />
        <AppRoutes />
      </BrowserRouter>
    </>
  );
}
