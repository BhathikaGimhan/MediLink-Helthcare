import { motion } from "framer-motion";
import { Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, deleteDoc } from "firebase/firestore";

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
  addedBy: string;
}

interface DoctorListProps {
  doctors: Doctor[];
  setDoctors: React.Dispatch<React.SetStateAction<Doctor[]>>;
  setActiveSection: (section: "dashboard" | "add-doctor" | "edit-doctor") => void;
  setSelectedDoctor: (doctor: Doctor | null) => void;
}

const AdminDoctorList = ({ doctors, setDoctors, setActiveSection, setSelectedDoctor }: DoctorListProps) => {
  const navigate = useNavigate();

  const handleRemoveDoctor = async (doctorId: string) => {
    if (!window.confirm("Are you sure you want to remove this doctor?")) return;
    try {
      await deleteDoc(doc(db, "doctors", doctorId));
      setDoctors((prev) => prev.filter((doctor) => doctor.id !== doctorId));
      alert("Doctor removed successfully!");
    } catch (err: any) {
      console.error("Error removing doctor:", { code: err.code, message: err.message });
      alert(
        err.code === "permission-denied"
          ? "Insufficient permissions to delete doctor."
          : "Failed to remove doctor."
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card p-6"
    >
      <h2 className="text-2xl font-bold neon-text mb-4">Doctors</h2>
      {doctors.length === 0 ? (
        <p className="text-gray-400">No doctors added yet.</p>
      ) : (
        <div className="space-y-4">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-cyan-500/30"
            >
              <div
                className="cursor-pointer hover:text-cyan-400"
                onClick={() => navigate(`/doctor/details/${doctor.id}`)}
              >
                <p className="font-semibold">{doctor.name}</p>
                <p className="text-sm text-gray-400">Specialty: {doctor.specialty}</p>
                <p className="text-sm text-gray-400">Added by: {doctor.addedBy}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedDoctor(doctor);
                    setActiveSection("edit-doctor");
                  }}
                  className="cyber-button flex items-center space-x-1"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleRemoveDoctor(doctor.id)}
                  className="cyber-button bg-red-500 flex items-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
export default AdminDoctorList;