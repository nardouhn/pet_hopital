// src/routes/routes.jsx
import { useRoutes, Navigate } from "react-router-dom";

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
import PetProfilePage from "@/pages/admin/PetProfilePage";
import VisitsPage from "@/pages/admin/VisitsPage";
import RecordsPage from "@/pages/admin/RecordsPage";
import ServicesPage from "@/pages/admin/ServicesPage";
import InvoicesPage from "@/pages/admin/InvoicesPage";
import HotelPage from "@/pages/admin/HotelPage";

import AuthGuard from "@/guards/AuthGuard";

function PlaceholderPage({ title, description }) {
  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="size-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg
              className="size-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return useRoutes([
    { path: "/", element: <HomePage /> },
    { path: "/signup", element: <SignupPage /> },
    { path: "/login", element: <LoginPage /> },
    { path: "/services/:slug", element: <ServicePage /> },

    {},
    {
      element: <AuthGuard />,
      children: [
        {
          path: "/admin",
          element: <AdminPage />,
          children: [
            {
              index: true,
              element: <Navigate to="/admin/overview" replace />,
            },
            {
              path: "overview",
              element: <Overview />,
            },
            {
              path: "doctors",
              element: <DoctorsPage />,
            },
            {
              path: "users",
              element: <UsersPage />,
            },
            {
              path: "pets",
              element: <PetsPage />,
            },
            {
              path: "pets/:petId",
              element: <PetProfilePage />,
            },
            {
              path: "appointments",
              element: <AppointmentsPage />,
            },
            {
              path: "visits",
              element: <VisitsPage />,
            },
            {
              path: "records",
              element: <RecordsPage />,
            },
            {
              path: "services",
              element: <ServicesPage />,
            },
            {
              path: "invoices",
              element: <InvoicesPage />,
            },
            {
              path: "hotel",
              element: <HotelPage />,
            },
            {
              path: "statistics",
              element: (
                <PlaceholderPage
                  title="Thống kê"
                  description="Statistics page coming soon"
                />
              ),
            },
            {
              path: "feedback",
              element: (
                <PlaceholderPage
                  title="Feedback"
                  description="Feedback page coming soon"
                />
              ),
            },
          ],
        },
      ],
    },

    { path: "*", element: <NotFound /> },
  ]);
}
