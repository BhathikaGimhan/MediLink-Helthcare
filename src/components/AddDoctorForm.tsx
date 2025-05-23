import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { db } from "../firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

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

interface AddDoctorFormProps {
  medicalCenter: { id: string; name: string } | null;
  setDoctors: React.Dispatch<React.SetStateAction<Doctor[]>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

const AddDoctorForm = ({ medicalCenter, setDoctors, setError }: AddDoctorFormProps) => {
  const [newDoctor, setNewDoctor] = useState<Partial<Doctor>>({
    name: "",
    specialty: "",
    rating: 4.0,
    reviews: 0,
    location: "",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300",
    bio: "",
    education: "",
    experience: "",
    procedures: [],
    availability: { status: "Available", nextSlot: "", schedule: [] },
    pharmacies: [],
    privateClinic: { name: "", address: "", facilities: [], appointments: "" },
  });

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicalCenter) {
      setError("No medical center assigned.");
      return;
    }
    try {
      const existingDoctor = await getDocs(
        query(collection(db, "doctors"), where("name", "==", newDoctor.name))
      );
      if (!existingDoctor.empty) {
        setError("This doctor is already registered with another medical center.");
        return;
      }

      const doctorData: Doctor = {
        ...newDoctor,
        medicalCenterId: medicalCenter.id,
        medicalCenterName: medicalCenter.name,
        id: "",
      } as Doctor;

      const docRef = await addDoc(collection(db, "doctors"), doctorData);
      setDoctors((prev) => [...prev, { ...doctorData, id: docRef.id }].slice(0, 3));
      setNewDoctor({
        name: "",
        specialty: "",
        rating: 4.0,
        reviews: 0,
        location: "",
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300",
        bio: "",
        education: "",
        experience: "",
        procedures: [],
        availability: { status: "Available", nextSlot: "", schedule: [] },
        pharmacies: [],
        privateClinic: { name: "", address: "", facilities: [], appointments: "" },
      });
    } catch (err: any) {
      setError(err.message || "Failed to add doctor.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card p-6"
    >
      <h2 className="text-2xl font-bold neon-text mb-4">Add New Doctor</h2>
      <form onSubmit={handleAddDoctor} className="space-y-4">
        <div>
          <label className="block text-gray-400">Name</label>
          <input
            type="text"
            value={newDoctor.name}
            onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
            className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
            required
          />
        </div>
        <div>
          <label className="block text-gray-400">Specialty</label>
          <input
            type="text"
            value={newDoctor.specialty}
            onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
            className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
            required
          />
        </div>
        <div>
          <label className="block text-gray-400">Location</label>
          <input
            type="text"
            value={newDoctor.location}
            onChange={(e) => setNewDoctor({ ...newDoctor, location: e.target.value })}
            className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <div>
          <label className="block text-gray-400">Bio</label>
          <textarea
            value={newDoctor.bio}
            onChange={(e) => setNewDoctor({ ...newDoctor, bio: e.target.value })}
            className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <div>
          <label className="block text-gray-400">Education</label>
          <input
            type="text"
            value={newDoctor.education}
            onChange={(e) => setNewDoctor({ ...newDoctor, education: e.target.value })}
            className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <div>
          <label className="block text-gray-400">Experience</label>
          <input
            type="text"
            value={newDoctor.experience}
            onChange={(e) => setNewDoctor({ ...newDoctor, experience: e.target.value })}
            className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <div>
          <label className="block text-gray-400">Procedures (comma-separated)</label>
          <input
            type="text"
            value={newDoctor.procedures?.join(", ")}
            onChange={(e) => setNewDoctor({ ...newDoctor, procedures: e.target.value.split(", ") })}
            className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <button
          type="submit"
          className="cyber-button w-full flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Doctor</span>
        </button>
      </form>
    </motion.div>
  );
};

export default AddDoctorForm;