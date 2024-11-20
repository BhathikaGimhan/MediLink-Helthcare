import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import DoctorRanking from "./pages/DoctorRanking";
import DoctorDetails from "./pages/DoctorDetails";
import Community from "./pages/Community";
import ChatHistory from "./pages/Chat";
import NotificationsPage from "./pages/NotificationsPage";

function App() {
  return (
    <BrowserRouter>
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
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
