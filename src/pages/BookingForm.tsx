import React, { useState } from 'react';
import { doc, setDoc, getDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { Doctor } from '../types';
import { motion } from 'framer-motion';
import { useUserStore } from '../stores/userStore';
import { useNotificationStore } from '../stores/notificationStore';
import Alert from '../components/Alert';

interface BookingFormProps {
  doctor: Doctor;
  userId: string;
  onClose: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ doctor, userId, onClose }) => {
  const { user } = useUserStore();
  const { addNotification } = useNotificationStore();
  const [dateTime, setDateTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !user) {
      setError('User not authenticated. Please log in.');
      setAlert({ message: 'User not authenticated. Please log in.', type: 'error' });
      return;
    }
    if (!dateTime) {
      setError('Please select a date and time.');
      setAlert({ message: 'Please select a date and time.', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const userName = userSnap.exists() ? userSnap.data().name || user.displayName || 'Anonymous' : 'Anonymous';
      const userEmail = userSnap.exists() ? userSnap.data().email || user.email || 'Unknown' : 'Unknown';

      const counterRef = doc(db, 'counters', 'bookingCounter');
      const counterSnap = await getDoc(counterRef);
      let bookingNumber = 1;
      if (counterSnap.exists()) {
        bookingNumber = counterSnap.data().lastNumber + 1;
      }
      await setDoc(counterRef, { lastNumber: bookingNumber }, { merge: true });

      const bookingRef = doc(collection(db, 'bookings'));
      const bookingData = {
        userId,
        userName,
        userEmail,
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorImage: doctor.image || "https://via.placeholder.com/150", // Save doctor image
        medicalCenterId: doctor.medicalCenterId,
        dateTime,
        createdAt: new Date().toISOString(),
        status: 'booked',
        bookingNumber,
        read: false, // Add read status for notifications
      };
      await setDoc(bookingRef, bookingData);

      const notificationMessage = `Appointment booked with Dr. ${doctor.name} on ${new Date(dateTime).toLocaleString()} at Medical Center ID: ${doctor.medicalCenterId}. Booking Number: ${bookingNumber}`;
      addNotification({
        id: bookingRef.id,
        message: notificationMessage,
        timestamp: new Date().toLocaleString(),
        read: false,
        bookingId: bookingRef.id,
      });

      setAlert({ message: 'Appointment booked successfully!', type: 'success' });
      setTimeout(onClose, 3000);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create booking.';
      setError(errorMessage);
      setAlert({ message: errorMessage, type: 'error' });
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
        {error && !alert && (
          <p className="text-red-400 bg-red-900/20 border border-red-500/30 p-2 rounded-lg mb-4">{error}</p>
        )}
        {alert && (
          <Alert
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert(null)}
          />
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