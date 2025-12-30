import { Navigate, Outlet } from "react-router-dom";

export default function AuthGuard({ role }) {
  // Fake auth (sau này thay bằng Redux / Context / API)
  const auth = JSON.parse(localStorage.getItem("auth"));

  if (!auth?.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có role
  if (role && auth.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
