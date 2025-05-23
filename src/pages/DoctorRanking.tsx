// src/pages/DoctorRanking.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Stethoscope } from "lucide-react";

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

const DoctorRanking = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorsCollection = collection(db, "doctors");
        const doctorsSnapshot = await getDocs(doctorsCollection);
        const doctorsList = doctorsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Doctor[];
        setDoctors(doctorsList);
      } catch (err: any) {
        setError(err.message || "Failed to fetch doctors.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-cyan-50">Loading...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-900 text-cyan-50 p-8"
    >
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold neon-text mb-8 text-center">Find a Doctor</h1>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 bg-red-900/20 border border-red-500/30 p-3 rounded-lg text-center mb-4"
          >
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <Link key={doctor.id} to={`/doctors/${doctor.id}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="cyber-card p-6 hover:scale-105 transition-transform"
              >
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-xl font-bold neon-text">{doctor.name}</h3>
                <p className="text-gray-400">{doctor.specialty}</p>
                <p className="text-gray-400">Medical Center: {doctor.medicalCenterName}</p>
                <p className="text-gray-400">Rating: {doctor.rating} ({doctor.reviews} reviews)</p>
                <p className="text-gray-400">Location: {doctor.location}</p>
                <div className="mt-2">
                  <p className="text-gray-400 font-bold">Procedures:</p>
                  <ul className="list-disc list-inside text-gray-400">
                    {doctor.procedures.map((proc, idx) => (
                      <li key={idx}>{proc}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2 flex items-center space-x-2">
                  <Stethoscope className="w-5 h-5 text-cyan-400" />
                  <p className="text-gray-400">View Details</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default DoctorRanking;