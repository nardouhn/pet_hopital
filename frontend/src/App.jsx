import React from "react";

import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToHash from "@/utils/ScrollToHash";
import HomePage from "@/pages/HomePage";
import NotFound from "@/pages/NotFound";
import SignupPage from "@/pages/SignupPage";
import LoginPage from "@/pages/LoginPage";
import ServicePage from "@/pages/ServicePage";
import PetsPage from "@/pages/PetsPage";
import PetDetail from "@/pages/PetDetail";
import ProfilePage from "@/pages/ProfilePage";
import MyAppointments from "@/pages/MyAppointments";
function App() {
  return (
    <>
      <Toaster richColors />

      <BrowserRouter>
        <ScrollToHash />
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/services/:slug" element={<ServicePage />} />
          <Route path="/pets" element={<PetsPage />} />
          <Route path="/pets/:id" element={<PetDetail />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/appointments/my" element={<MyAppointments />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
