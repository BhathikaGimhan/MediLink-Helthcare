// src/pages/DoctorDetails.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Calendar } from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  location: string;
  image: string;
  bio: string;
  education: string;
  experience: string;
  procedures: string[];
  availability: {
    status: string;
    nextSlot: string;
    schedule: string[];
  };
  pharmacies: { name: string; address: string; hours: string; specialties: string[] }[];
  privateClinic: { name: string; address: string; facilities: string[]; appointments: string };
  medicalCenterId: string;
  medicalCenterName: string;
}

const DoctorDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "doctors", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDoctor({ id: docSnap.id, ...docSnap.data() } as Doctor);
        } else {
          setError("Doctor not found.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch doctor details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  const handleBookAppointment = () => {
    navigate(`/book/${id}`);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-cyan-50">Loading...</div>;
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-cyan-50">
        <div className="text-red-400 bg-red-900/20 border border-red-500/30 p-3 rounded-lg text-center">
          {error || "Doctor not found."}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-900 text-cyan-50 p-8"
    >
      <div className="container mx-auto">
        <div className="cyber-card p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <img
              src={doctor.image}
              alt={doctor.name}
              className="w-full md:w-1/3 h-64 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold neon-text">{doctor.name}</h1>
              <p className="text-gray-400">{doctor.specialty}</p>
              <p className="text-gray-400">Medical Center: {doctor.medicalCenterName}</p>
              <p className="text-gray-400">Rating: {doctor.rating} ({doctor.reviews} reviews)</p>
              <p className="text-gray-400">Location: {doctor.location}</p>
              <p className="text-gray-400 mt-4">{doctor.bio}</p>
              <p className="text-gray-400">Education: {doctor.education}</p>
              <p className="text-gray-400">Experience: {doctor.experience}</p>
              <button
                onClick={handleBookAppointment}
                className="cyber-button mt-4 flex items-center justify-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Book Appointment</span>
              </button>
            </div>
          </div>
          <div className="mt-8">
            <h2 className="text-2xl font-bold neon-text mb-4">Procedures</h2>
            <ul className="list-disc list-inside text-gray-400">
              {doctor.procedures.map((proc, idx) => (
                <li key={idx}>{proc}</li>
              ))}
            </ul>
          </div>
          <div className="mt-8">
            <h2 className="text-2xl font-bold neon-text mb-4">Availability</h2>
            <p className="text-gray-400">Status: {doctor.availability.status}</p>
            <p className="text-gray-400">Next Slot: {doctor.availability.nextSlot}</p>
            <p className="text-gray-400">Schedule: {doctor.availability.schedule.join(", ")}</p>
          </div>
          <div className="mt-8">
            <h2 className="text-2xl font-bold neon-text mb-4">Pharmacies</h2>
            {doctor.pharmacies.map((pharmacy, idx) => (
              <div key={idx} className="text-gray-400 mb-4">
                <p className="font-bold">{pharmacy.name}</p>
                <p>{pharmacy.address}</p>
                <p>Hours: {pharmacy.hours}</p>
                <p>Specialties: {pharmacy.specialties.join(", ")}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <h2 className="text-2xl font-bold neon-text mb-4">Private Clinic</h2>
            <p className="text-gray-400">{doctor.privateClinic.name}</p>
            <p className="text-gray-400">{doctor.privateClinic.address}</p>
            <p className="text-gray-400">Facilities: {doctor.privateClinic.facilities.join(", ")}</p>
            <p className="text-gray-400">Appointments: {doctor.privateClinic.appointments}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DoctorDetails;