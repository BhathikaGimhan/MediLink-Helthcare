import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import { Booking } from '../types';

interface AdminBookingsTableProps {
  medicalCenterId: string;
}

const AdminBookingsTable: React.FC<AdminBookingsTableProps> = ({ medicalCenterId }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('medicalCenterId', '==', medicalCenterId)
        );
        const bookingsDocs = await getDocs(bookingsQuery);
        const bookingsList = bookingsDocs.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Booking[];
        setBookings(bookingsList);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch bookings.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, [medicalCenterId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-red-400 bg-red-900/20 border border-red-500/30 p-3 rounded-lg text-center"
      >
        {error}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card p-6 rounded-xl border border-cyan-500/30"
    >
      <h2 className="text-2xl font-bold neon-text text-cyan-400 mb-4">Bookings</h2>
      {bookings.length === 0 ? (
        <p className="text-gray-400">No bookings found for this medical center.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-300">
            <thead>
              <tr className="border-b border-cyan-500/20">
                <th className="p-3 font-semibold">Booking Number</th>
                <th className="p-3 font-semibold">User Name</th>
                <th className="p-3 font-semibold">User Email</th>
                <th className="p-3 font-semibold">Doctor</th>
                <th className="p-3 font-semibold">Date & Time</th>
                <th className="p-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-cyan-500/20 hover:bg-gray-800/50">
                  <td className="p-3">{booking.bookingNumber}</td>
                  <td className="p-3">{booking.userName}</td>
                  <td className="p-3">{booking.userEmail}</td>
                  <td className="p-3">{booking.doctorName}</td>
                  <td className="p-3">{booking.dateTime}</td>
                  <td className="p-3">{booking.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default AdminBookingsTable;