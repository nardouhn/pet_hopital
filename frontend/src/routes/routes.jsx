// src/routes/routes.jsx
import { useRoutes } from "react-router-dom";

import HomePage from "@/pages/HomePage";
import SignupPage from "@/pages/SignupPage";
import LoginPage from "@/pages/LoginPage";
import ServicePage from "@/pages/ServicePage";
import NotFound from "@/pages/NotFound";
import UserProfile from "@/pages/UserProfile";

import AdminPage from "@/pages/admin/AdminPage";
import Overview from "@/pages/admin/Overview";
import UsersPage from "@/pages/admin/UsersPage";
import DoctorsPage from "@/pages/admin/DoctorsPage";
import PetsPage from "@/pages/admin/PetsPage";
import AppointmentsPage from "@/pages/admin/AppointmentsPage";
import UserAppointmentsPage from "@/pages/AppointmentPage";
import AppointmentHistory from "@/pages/AppointmentPage";

import AuthGuard from "@/guards/AuthGuard";

export default function AppRoutes() {
  return useRoutes([
    { path: "/", element: <HomePage /> },
    { path: "/signup", element: <SignupPage /> },
    { path: "/login", element: <LoginPage /> },
    { path: "/services/:slug", element: <ServicePage /> },

    {},
    {
      path: "/admin",
      element: <AuthGuard role="admin" />,
      children: [
        {
          element: <AdminPage />,
          children: [
            { index: true, element: <Overview /> },
            { path: "users", element: <UsersPage /> },
            { path: "doctors", element: <DoctorsPage /> },
            { path: "pets", element: <PetsPage /> },
            { path: "appointments", element: <AppointmentsPage /> },
          ],
        },
      ],
    },

    {
      path: "/appointments",
      element: <AuthGuard role="customer" />,
      children: [
        { index: true, element: <UserAppointmentsPage /> },
        { path: "history", element: <AppointmentHistory /> },
      ],
    },
    {
      path: "/profile",
      element: <AuthGuard />,
      children: [{ index: true, element: <UserProfile /> }],
    },
    { path: "*", element: <NotFound /> },
  ]);
}
