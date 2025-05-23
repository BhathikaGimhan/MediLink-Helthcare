// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useUserStore } from "../stores/userStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { user, isLoading } = useUserStore();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-cyan-50">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== "admin-1") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;