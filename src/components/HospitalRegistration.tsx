import { useState } from "react";
import { motion } from "framer-motion";

interface HospitalDetails {
  name: string;
  location: string;
  contact: string;
}

interface HospitalRegistrationProps {
  onRegisterHospital: (hospital: HospitalDetails) => void;
}

const HospitalRegistration: React.FC<HospitalRegistrationProps> = ({
  onRegisterHospital,
}) => {
  const [hospitalDetails, setHospitalDetails] = useState<HospitalDetails>({
    name: "",
    location: "",
    contact: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHospitalDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onRegisterHospital(hospitalDetails);
    setHospitalDetails({ name: "", location: "", contact: "" });
  };

  return (
    <motion.div
      className="p-6 max-w-lg mx-auto bg-gray-900 text-gray-100 rounded-lg shadow-md"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-cyan-400 mb-4">
        Register a Private Hospital
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm">Hospital Name</label>
          <input
            type="text"
            name="name"
            value={hospitalDetails.name}
            onChange={handleChange}
            className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
            placeholder="Enter hospital name"
            required
          />
        </div>
        <div>
          <label className="block text-sm">Location</label>
          <input
            type="text"
            name="location"
            value={hospitalDetails.location}
            onChange={handleChange}
            className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
            placeholder="Enter location"
            required
          />
        </div>
        <div>
          <label className="block text-sm">Contact</label>
          <input
            type="text"
            name="contact"
            value={hospitalDetails.contact}
            onChange={handleChange}
            className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
            placeholder="Enter contact details"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          Register Hospital
        </button>
      </form>
    </motion.div>
  );
};

export default HospitalRegistration;
