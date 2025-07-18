import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

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

interface EditDoctorFormProps {
  selectedDoctor: Doctor | null;
  setDoctors: React.Dispatch<React.SetStateAction<Doctor[]>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setActiveSection: (section: "dashboard" | "add-doctor" | "edit-doctor") => void;
}

const EditDoctorForm = ({ selectedDoctor, setDoctors, setError, setActiveSection }: EditDoctorFormProps) => {
  const [doctorData, setDoctorData] = useState<Doctor | null>(null);

  useEffect(() => {
    if (selectedDoctor) {
      setDoctorData({ ...selectedDoctor });
    } else {
      setError("No doctor selected.");
      setActiveSection("dashboard");
    }
  }, [selectedDoctor, setError, setActiveSection]);

  const handleUpdateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorData || !doctorData.id) {
      setError("No doctor selected for update.");
      return;
    }
    try {
      const doctorRef = doc(db, "doctors", doctorData.id);
      // Prepare update data without the id field
      const updateData: Omit<Doctor, "id" | "medicalCenterId" | "medicalCenterName"> = {
        name: doctorData.name || "",
        specialty: doctorData.specialty || "",
        rating: doctorData.rating || 4.0,
        reviews: doctorData.reviews || 0,
        location: doctorData.location || "",
        image: doctorData.image || "",
        bio: doctorData.bio || "",
        education: doctorData.education || "",
        experience: doctorData.experience || "",
        procedures: doctorData.procedures || [],
        availability: doctorData.availability || { status: "Available", nextSlot: "", schedule: [] },
        pharmacies: doctorData.pharmacies || [],
        privateClinic: doctorData.privateClinic || { name: "", address: "", facilities: [], appointments: "" },
        addedBy: doctorData.addedBy || "",
      };
  
      await updateDoc(doctorRef, updateData);
      setDoctors((prev) =>
        prev.map((doc) => (doc.id === doctorData.id ? doctorData : doc))
      );
      setActiveSection("dashboard");
      alert("Doctor updated successfully!");
    } catch (err: any) {
      console.error("Error updating doctor:", { code: err.code, message: err.message });
      setError(
        err.code === "permission-denied"
          ? "Insufficient permissions to update doctor."
          : err.message || "Failed to update doctor."
      );
    }
  };

  if (!doctorData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="cyber-card p-6 text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg text-center"
      >
        No doctor selected.
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card p-6"
    >
      <h2 className="text-2xl font-bold neon-text mb-4">Edit Doctor: {doctorData.name}</h2>
      <form onSubmit={handleUpdateDoctor} className="space-y-4">
        <div>
          <label className="block text-gray-400">Name</label>
          <input
            type="text"
            value={doctorData.name}
            onChange={(e) => setDoctorData({ ...doctorData, name: e.target.value })}
            className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
            required
          />
        </div>
        <div>
          <label className="block text-gray-400">Specialty</label>
          <input
            type="text"
            value={doctorData.specialty}
            onChange={(e) => setDoctorData({ ...doctorData, specialty: e.target.value })}
            className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
            required
          />
        </div>
        <div>
          <label className="block text-gray-400">Location</label>
          <input
            type="text"
            value={doctorData.location}
            onChange={(e) => setDoctorData({ ...doctorData, location: e.target.value })}
            className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <div>
          <label className="block text-gray-400">Image URL</label>
          <input
            type="text"
            value={doctorData.image}
            onChange={(e) => setDoctorData({ ...doctorData, image: e.target.value })}
            className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <div>
          <label className="block text-gray-400">Bio</label>
          <textarea
            value={doctorData.bio}
            onChange={(e) => setDoctorData({ ...doctorData, bio: e.target.value })}
            className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <div>
          <label className="block text-gray-400">Education</label>
          <input
            type="text"
            value={doctorData.education}
            onChange={(e) => setDoctorData({ ...doctorData, education: e.target.value })}
            className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <div>
          <label className="block text-gray-400">Experience</label>
          <input
            type="text"
            value={doctorData.experience}
            onChange={(e) => setDoctorData({ ...doctorData, experience: e.target.value })}
            className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <div>
          <label className="block text-gray-400">Procedures (comma-separated)</label>
          <input
            type="text"
            value={doctorData.procedures.join(", ")}
            onChange={(e) => setDoctorData({ ...doctorData, procedures: e.target.value.split(", ").filter(Boolean) })}
            className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <div>
          <label className="block text-gray-400">Availability Status</label>
          <select
            value={doctorData.availability.status}
            onChange={(e) => setDoctorData({ ...doctorData, availability: { ...doctorData.availability, status: e.target.value } })}
            className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
          >
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-400">Next Available Slot</label>
          <input
            type="text"
            value={doctorData.availability.nextSlot}
            onChange={(e) => setDoctorData({ ...doctorData, availability: { ...doctorData.availability, nextSlot: e.target.value } })}
            className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <div>
          <label className="block text-gray-400">Schedule (comma-separated)</label>
          <input
            type="text"
            value={doctorData.availability.schedule.join(", ")}
            onChange={(e) => setDoctorData({ ...doctorData, availability: { ...doctorData.availability, schedule: e.target.value.split(", ").filter(Boolean) } })}
            className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <div>
          <label className="block text-gray-400">Private Clinic Name</label>
          <input
            type="text"
            value={doctorData.privateClinic.name}
            onChange={(e) => setDoctorData({ ...doctorData, privateClinic: { ...doctorData.privateClinic, name: e.target.value } })}
            className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <div>
          <label className="block text-gray-400">Private Clinic Address</label>
          <input
            type="text"
            value={doctorData.privateClinic.address}
            onChange={(e) => setDoctorData({ ...doctorData, privateClinic: { ...doctorData.privateClinic, address: e.target.value } })}
            className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <div>
          <label className="block text-gray-400">Private Clinic Facilities (comma-separated)</label>
          <input
            type="text"
            value={doctorData.privateClinic.facilities.join(", ")}
            onChange={(e) => setDoctorData({ ...doctorData, privateClinic: { ...doctorData.privateClinic, facilities: e.target.value.split(", ").filter(Boolean) } })}
            className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <div className="flex space-x-4">
          <button
            type="submit"
            className="cyber-button w-full flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Save Changes</span>
          </button>
          <button
            type="button"
            className="cyber-button w-full flex items-center justify-center space-x-2 bg-gray-600"
            onClick={() => setActiveSection("dashboard")}
          >
            <span>Cancel</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default EditDoctorForm;