import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import DoctorRanking from "./pages/DoctorRanking";
import DoctorDetails from "./pages/DoctorDetails";
import Community from "./pages/Community";
import ChatHistory from "./pages/Chat";
import NotificationsPage from "./pages/NotificationsPage";
import Login from "./pages/Login";
import TreatmentReport from "./pages/TreatmentReport";
import Registration from "./pages/Registration";
import AdminDashboard from "./pages/AdminDashboard";
import Booking from "./pages/Booking";
import { useEffect, useState } from "react";
import Loader from "./components/Loader";
import ErrorBoundary from "./components/ErrorBoundary";
import { useUserStore } from "./stores/userStore";
import ProtectedRoute from "./components/ProtectedRoute";

// New component to handle routing and conditional centering
function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const { initializeAuth } = useUserStore();
  const location = useLocation(); // Now inside BrowserRouter context

  useEffect(() => {
    initializeAuth();
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [initializeAuth]);

  // Determine if the current route is not admin
  const isUserView = location.pathname !== "/admin";

  return isLoading ? (
    <Loader />
  ) : (
    <div className="min-h-screen bg-gray-900 text-cyan-50 font-sans">
      <div className="cyber-gradient fixed inset-0 pointer-events-none w-full" />
      <Navbar />
      <main
        className={`container pt-20 pb-8 ${
          isUserView ? "ml-[10%]" : ""
        }`}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<DoctorRanking />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/doctors/details/:id" element={<DoctorDetails />} />
          <Route path="/community" element={<Community />} />
          <Route
            path="/chat-history"
            element={
              <ProtectedRoute>
                <ChatHistory />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/report" element={<TreatmentReport />} />
          <Route path="/reg" element={<Registration />} />
          <Route
            path="/book/:id"
            element={
              <ProtectedRoute>
                <Booking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;