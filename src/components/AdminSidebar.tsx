import { motion } from "framer-motion";
import { Building, Plus, User, ChevronDown, ChevronUp } from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  addedBy: string; // Admin ID who added the doctor
}

interface AdminSidebarProps {
  activeSection: "dashboard" | "add-doctor" | "edit-doctor";
  setActiveSection: (section: "dashboard" | "add-doctor" | "edit-doctor") => void;
  doctors: Doctor[];
}

const AdminSidebar = ({ activeSection, setActiveSection }: AdminSidebarProps) => {
  

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full sm:w-48 md:w-56 lg:w-64 bg-gray-900/95 p-4 sm:p-6 border-r border-cyan-500/30 shadow-lg shadow-cyan-500/10 min-h-screen"
    >
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold neon-text bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-pink-500">
          Admin Menu
        </h2>
      </div>

      {/* Navigation */}
      <nav className="space-y-3 sm:space-y-4">
        <button
          onClick={() => setActiveSection("dashboard")}
          className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 ${
            activeSection === "dashboard"
              ? "bg-cyan-500/20 text-cyan-400 neon-text shadow-md shadow-cyan-500/30"
              : "text-gray-300 hover:bg-gray-800 hover:text-cyan-400"
          }`}
        >
          <Building className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-medium text-sm sm:text-base">Dashboard</span>
        </button>
        <button
          onClick={() => setActiveSection("add-doctor")}
          className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 ${
            activeSection === "add-doctor"
              ? "bg-cyan-500/20 text-cyan-400 neon-text shadow-md shadow-cyan-500/30"
              : "text-gray-300 hover:bg-gray-800 hover:text-cyan-400"
          }`}
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-medium text-sm sm:text-base">Add Doctor</span>
        </button>
        
      </nav>
    </motion.div>
  );
};

export default AdminSidebar;