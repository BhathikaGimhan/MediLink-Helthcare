import { motion } from "framer-motion";
import { X, Star, Calendar } from "lucide-react";
import { useState } from "react";
import { NavigateFunction } from "react-router-dom";
import { Doctor } from "../../pages/Chat";

interface DoctorSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctors: Doctor[];
  navigate: NavigateFunction;
}

const DoctorSuggestionModal: React.FC<DoctorSuggestionModalProps> = ({
  isOpen,
  onClose,
  doctors,
  navigate,
}) => {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<string>("");

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
  };

  const confirmBooking = () => {
    if (selectedDoctor && selectedDateTime) {
      console.log(
        `Booking confirmed with ${selectedDoctor.name} for ${selectedDateTime}`
      );
      setSelectedDoctor(null);
      setSelectedDateTime("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="cyber-card bg-gray-900 p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-cyan-50">
            Suggested Doctors
          </h2>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-cyan-400" />
          </button>
        </div>

        {doctors.length === 0 ? (
          <p className="text-gray-400">No doctors found for your condition.</p>
        ) : (
          <div className="space-y-4">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="p-4 bg-gray-800 border border-cyan-500/30 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-cyan-50">
                        {doctor.name}
                      </h3>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-gray-400 ml-1">
                          {doctor.rating} ({doctor.reviews} reviews)
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">{doctor.specialty}</p>
                    <p className="text-sm text-gray-400">{doctor.location}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-400">{doctor.bio}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    <strong>Next Available:</strong> {doctor.availability.nextSlot}
                  </p>
                </div>
                <div className="flex space-x-2 mt-2">
                  <button
                    className="cyber-button flex-1 flex items-center justify-center space-x-2"
                    onClick={() => handleBookAppointment(doctor)}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Appointment</span>
                  </button>
                  <button
                    className="cyber-button flex-1"
                    onClick={() => navigate(`/doctor/details/${doctor.id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedDoctor && (
          <div className="mt-4 p-4 bg-gray-800 border border-cyan-500/30 rounded-lg">
            <h3 className="text-lg font-semibold text-cyan-50">
              Book Appointment with {selectedDoctor.name}
            </h3>
            <p className="text-sm text-gray-400 mb-2">
              Select a date and time:
            </p>
            <select
              className="w-full px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400"
              value={selectedDateTime}
              onChange={(e) => setSelectedDateTime(e.target.value)}
            >
              <option value="">Select a time slot</option>
              {selectedDoctor.availability.schedule.map((slot, index) => (
                <option key={index} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
            <div className="flex space-x-2 mt-2">
              <button
                className="cyber-button flex-1"
                onClick={confirmBooking}
                disabled={!selectedDateTime}
              >
                Confirm Booking
              </button>
              <button
                className="cyber-button flex-1"
                onClick={() => setSelectedDoctor(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DoctorSuggestionModal;