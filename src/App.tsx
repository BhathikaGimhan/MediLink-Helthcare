import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import DoctorRanking from "./pages/DoctorRanking";
import DoctorDetails from "./pages/DoctorDetails";
import Community from "./pages/Community";
import ChatHistory from "./pages/Chat";
import NotificationsPage from "./pages/NotificationsPage";
import GoogleLogin from "./pages/Login";
import TreatmentReport from "./pages/TreatmentReport";
import Registration from "./pages/Registration";
import { useEffect, useState } from "react";
import Loader from "./components/Loader";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Adjust the loading time
    return () => clearTimeout(timer);
  }, []);
  return (
    <BrowserRouter>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="min-h-screen bg-gray-900 text-cyan-50 font-sans">
          <div className="cyber-gradient fixed inset-0 pointer-events-none" />
          <Navbar />
          <main className="container mx-auto px-4 pt-20 pb-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/doctors" element={<DoctorRanking />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/doctors/:id" element={<DoctorDetails />} />
              <Route path="/community" element={<Community />} />
              <Route path="/chat-history" element={<ChatHistory />} />
              <Route path="/login" element={<GoogleLogin />} />
              <Route path="/report" element={<TreatmentReport />} />
              <Route path="/reg" element={<Registration />} />
            </Routes>
          </main>
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;
