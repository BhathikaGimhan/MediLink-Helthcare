import React, { useState } from 'react';
import { doc, setDoc, getDoc, increment, updateDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { Doctor } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../stores/userStore';

interface BookingFormProps {
  doctor: Doctor;
  userId: string;
  onClose: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ doctor, userId, onClose }) => {
  const { user } = useUserStore();
  const [dateTime, setDateTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !user) {
      setError('User not authenticated. Please log in.');
      return;
    }
    if (!dateTime) {
      setError('Please select a date and time.');
      return;
    }

    setIsLoading(true);
    try {
      // Fetch user details
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const userName = userSnap.exists() ? userSnap.data().name || user.displayName || 'Anonymous' : 'Anonymous';
      const userEmail = userSnap.exists() ? userSnap.data().email || user.email || 'Unknown' : 'Unknown';

      // Generate booking number
      const counterRef = doc(db, 'counters', 'bookingCounter');
      const counterSnap = await getDoc(counterRef);
      let bookingNumber = 1;
      if (counterSnap.exists()) {
        bookingNumber = counterSnap.data().lastNumber + 1;
      }
      await setDoc(counterRef, { lastNumber: bookingNumber }, { merge: true });

      // Save booking
      const bookingRef = doc(collection(db, 'bookings'));
      await setDoc(bookingRef, {
        userId,
        userName,
        userEmail,
        doctorId: doctor.id,
        doctorName: doctor.name,
        medicalCenterId: doctor.medicalCenterId,
        dateTime,
        createdAt: new Date().toISOString(),
        status: 'booked',
        bookingNumber,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create booking.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
        className="bg-gray-900 p-6 rounded-md shadow-lg border border-cyan-500/30 max-w-md w-full"
      >
        <h3 className="text-xl font-bold neon-text mb-4">Book Appointment with {doctor.name}</h3>
        {error && (
          <p className="text-red-400 bg-red-900/20 border border-red-500/30 p-2 rounded-lg mb-4">{error}</p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-gray-400 block mb-2">Select Date & Time</label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800 text-cyan-50 border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 bg-gray-800 text-cyan-50 rounded hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition ${
                isLoading ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default BookingForm;