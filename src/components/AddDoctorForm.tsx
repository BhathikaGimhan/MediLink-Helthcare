
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { db } from "../firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { useUserStore } from "../stores/userStore";

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

interface AddDoctorFormProps {
  medicalCenter: { id: string; name: string } | null;
  setDoctors: React.Dispatch<React.SetStateAction<Doctor[]>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

const AddDoctorForm = ({ medicalCenter, setDoctors, setError }: AddDoctorFormProps) => {
  const { user } = useUserStore();
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
    addedBy: user?.id || "",
  });

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicalCenter) {
      setError("No medical center assigned.");
      return;
    }
    if (!user) {
      setError("No user authenticated.");
      return;
    }
    try {
      // Check for existing doctor
      const existingDoctor = await getDocs(
        query(collection(db, "doctors"), where("name", "==", newDoctor.name))
      );
      if (!existingDoctor.empty) {
        setError("This doctor is already registered with another medical center.");
        return;
      }
  
      // Prepare doctor data without the id field
      const doctorData: Omit<Doctor, "id"> = {
        name: newDoctor.name || "",
        specialty: newDoctor.specialty || "",
        rating: newDoctor.rating || 4.0,
        reviews: newDoctor.reviews || 0,
        location: newDoctor.location || "",
        image: newDoctor.image || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300",
        bio: newDoctor.bio || "",
        education: newDoctor.education || "",
        experience: newDoctor.experience || "",
        procedures: newDoctor.procedures || [],
        availability: newDoctor.availability || { status: "Available", nextSlot: "", schedule: [] },
        pharmacies: newDoctor.pharmacies || [],
        privateClinic: newDoctor.privateClinic || { name: "", address: "", facilities: [], appointments: "" },
        medicalCenterId: medicalCenter.id,
        medicalCenterName: medicalCenter.name,
        addedBy: user.id,
      };
  
      // Add document to Firestore
      const docRef = await addDoc(collection(db, "doctors"), doctorData);
      
      // Update local state with the new doctor, including the generated ID
      setDoctors((prev) => [...prev, { ...doctorData, id: docRef.id }]);
      
      // Reset form
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
        addedBy: user.id,
      });
      alert("Doctor added successfully!");
    } catch (err: any) {
      console.error("Error adding doctor:", { code: err.code, message: err.message });
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
          <label className="block text-gray-400">Image URL</label>
          <input
            type="text"
            value={newDoctor.image}
            onChange={(e) => setNewDoctor({ ...newDoctor, image: e.target.value })}
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
        <div>
          <label className="block text-gray-400">Availability Status</label>
          <select
            value={newDoctor.availability?.status}
            onChange={(e) => setNewDoctor({ ...newDoctor, availability: { ...newDoctor.availability!, status: e.target.value } })}
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
            value={newDoctor.availability?.nextSlot}
            onChange={(e) => setNewDoctor({ ...newDoctor, availability: { ...newDoctor.availability!, nextSlot: e.target.value } })}
            className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <div>
          <label className="block text-gray-400">Schedule (comma-separated)</label>
          <input
            type="text"
            value={newDoctor.availability?.schedule?.join(", ")}
            onChange={(e) => setNewDoctor({ ...newDoctor, availability: { ...newDoctor.availability!, schedule: e.target.value.split(", ") } })}
            className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <div>
          <label className="block text-gray-400">Private Clinic Name</label>
          <input
            type="text"
            value={newDoctor.privateClinic?.name}
            onChange={(e) => setNewDoctor({ ...newDoctor, privateClinic: { ...newDoctor.privateClinic!, name: e.target.value } })}
            className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <div>
          <label className="block text-gray-400">Private Clinic Address</label>
          <input
            type="text"
            value={newDoctor.privateClinic?.address}
            onChange={(e) => setNewDoctor({ ...newDoctor, privateClinic: { ...newDoctor.privateClinic!, address: e.target.value } })}
            className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <div>
          <label className="block text-gray-400">Private Clinic Facilities (comma-separated)</label>
          <input
            type="text"
            value={newDoctor.privateClinic?.facilities?.join(", ")}
            onChange={(e) => setNewDoctor({ ...newDoctor, privateClinic: { ...newDoctor.privateClinic!, facilities: e.target.value.split(", ") } })}
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