import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

interface BookingDetailsPopupProps {
  bookingId: string;
  onClose: () => void;
}

const BookingDetailsPopup: React.FC<BookingDetailsPopupProps> = ({ bookingId, onClose }) => {
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        // console.log("Fetching booking details for ID:", bookingId); // Debug log
        const bookingRef = doc(db, "bookings", bookingId);
        const bookingSnap = await getDoc(bookingRef);
        if (bookingSnap.exists()) {
          setBooking(bookingSnap.data());
        //   console.log("Booking details:", bookingSnap.data()); // Debug log
        } else {
          setError("Booking not found.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch booking details.");
        console.error("Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-cyan-300">Appointment Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-cyan-300 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {isLoading ? (
          <p className="text-gray-400">Loading...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <div className="space-y-4 text-gray-200">
            {booking.doctorImage && (
              <div className="flex justify-center">
                <img
                  src={booking.doctorImage}
                  alt="Doctor"
                  className="w-24 h-24 rounded-full object-cover border border-cyan-500"
                  onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/150")}
                />
              </div>
            )}
            <p><strong>Booking Number:</strong> {booking.bookingNumber}</p>
            <p><strong>Doctor:</strong> Dr. {booking.doctorName}</p>
            <p><strong>Date & Time:</strong> {new Date(booking.dateTime).toLocaleString()}</p>
            <p><strong>Medical Center ID:</strong> {booking.medicalCenterId}</p>
            <p><strong>User:</strong> {booking.userName}</p>
            <p><strong>Email:</strong> {booking.userEmail}</p>
            <p><strong>Status:</strong> {booking.status}</p>
            <p><strong>Created At:</strong> {new Date(booking.createdAt).toLocaleString()}</p>
          </div>
        )}
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BookingDetailsPopup;