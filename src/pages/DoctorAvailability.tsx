import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Doctor } from '../types';
import { useUserStore } from '../stores/userStore';
import { motion, AnimatePresence } from 'framer-motion';

interface DoctorAvailabilityProps {
  doctor: Doctor;
}

const DoctorAvailability: React.FC<DoctorAvailabilityProps> = ({ doctor }) => {
  const { user } = useUserStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleAvailability = async () => {
    if (!user || user.role !== 'admin-1') return;

    setIsLoading(true);
    try {
      const doctorRef = doc(db, 'doctors', doctor.id);
      const newStatus = doctor.availability.status === 'Available' ? 'Unavailable' : 'Available';
      await updateDoc(doctorRef, {
        'availability.status': newStatus,
        isAvailable: newStatus === 'Available',
        updatedAt: new Date().toISOString(),
        updatedBy: user.id,
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating availability:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative mt-2">
      <button
        onClick={() => setIsModalOpen(true)}
        className={`px-2 py-1 rounded text-sm font-medium text-white transition-all duration-200 ${
          doctor.availability.status === 'Available'
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-red-600 hover:bg-red-600'
        }`}
      >
        {doctor.availability.status}
      </button>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 p-5 rounded-md shadow-lg border border-cyan-500/30"
            >
              <h3 className="text-md font-bold text-cyan-50 mb-3">
                Confirm Availability
              </h3>
              <p className="text-gray-400 mb-4">
                Set {doctor.name} to {doctor.availability.status === 'Available' ? 'Unavailable' : 'Available'}?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1 bg-gray-800 text-cyan-50 rounded hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleToggleAvailability}
                  disabled={isLoading}
                  className={`px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition ${
                    isLoading ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Updating...' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorAvailability;