import { useState } from "react";
import { motion } from "framer-motion";
import Doctors from "../components/Doctors";
import Patients from "../components/Patients";

const Community = () => {
  const [activeTab, setActiveTab] = useState("Doctors");

  const tabs = [
    { id: "Doctors", label: "Doctors' Community" },
    { id: "Patients", label: "Patients' Problems" },
  ];

  return (
    <div className="space-y-8 min-h-screen bg-gray-900 p-4 md:p-8">
      {/* Navigation */}
      <div className="relative">
        <nav className="flex justify-center space-x-8 bg-gray-900/90 py-4 border-b border-cyan-500/30">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer relative text-gray-400 text-lg font-bold transition-all duration-300 hover:text-cyan-400 ${
                activeTab === tab.id ? "text-cyan-400 neon-text" : ""
              }`}
            >
              {tab.label}
            </div>
          ))}
        </nav>

        {/* Horizontal Glow Effect */}
        <motion.div
          layoutId="active-tab-indicator"
          className="absolute bottom-0 h-1 neon-glow bg-cyan-400 rounded-md"
          initial={false}
          animate={{
            left: `${tabs.findIndex((tab) => tab.id === activeTab) * 50}%`,
            width: "50%",
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
        />
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {activeTab === "Doctors" ? <Doctors /> : <Patients />}
      </motion.div>
    </div>
  );
};

export default Community;