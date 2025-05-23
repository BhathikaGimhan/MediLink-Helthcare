// src/pages/Booking.tsx
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

const Booking = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-900 text-cyan-50 p-8"
    >
      <div className="container mx-auto">
        <div className="cyber-card p-8">
          <h1 className="text-3xl font-bold neon-text mb-4">Book Appointment</h1>
          <p className="text-gray-400">Booking functionality for Doctor ID: {id} is coming soon!</p>
          <p className="text-gray-400">Please contact the medical center directly to schedule an appointment.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Booking;