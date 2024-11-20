// Community.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";

import Doctors from "../components/Doctors";
import Patients from "../components/Patients";

const Community = () => {
  const [activeTab, setActiveTab] = useState("Doctors");

  const navItemVariants = {
    initial: { scale: 1, opacity: 0.7 },
    active: {
      scale: 1.2,
      opacity: 1,
      transition: { type: "spring", stiffness: 300 },
    },
    hover: { scale: 1.1, color: "#67e8f9", transition: { duration: 0.3 } },
  };

  return (
    <div className="space-y-8">
      {/* Navigation */}
      <div className="flex justify-center space-x-6 mb-8">
        {["Doctors", "Patients"].map((tab) => (
          <motion.button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`cyber-button ${
              activeTab === tab
                ? "bg-cyan-500/20 text-cyan-400"
                : "text-gray-400"
            } py-2 px-4 rounded-lg shadow-lg`}
            variants={navItemVariants}
            initial="initial"
            animate={activeTab === tab ? "active" : "initial"}
            whileHover="hover"
          >
            {tab}
          </motion.button>
        ))}
      </div>

      {/* Conditional Rendering */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.5 }}
      >
        {activeTab === "Doctors" ? <Doctors /> : <Patients />}
      </motion.div>
    </div>
  );
};

export default Community;
