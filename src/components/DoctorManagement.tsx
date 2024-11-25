import { useState, ChangeEvent, FormEvent } from "react";
import { motion } from "framer-motion";

interface DoctorDetails {
  name: string;
  specialty: string;
  rating: string;
  reviews: string;
  location: string;
  image: string;
  bio: string;
  education: string;
  experience: string;
  procedures: string;
  availability: string;
  pharmacies: string;
  privateClinic: string;
}

interface DoctorManagementProps {
  hospitalName: string;
}

const DoctorManagement: React.FC<DoctorManagementProps> = ({
  hospitalName,
}) => {
  const [doctors, setDoctors] = useState<DoctorDetails[]>([]);
  const [doctorDetails, setDoctorDetails] = useState<DoctorDetails>({
    name: "",
    specialty: "",
    rating: "",
    reviews: "",
    location: "",
    image: "",
    bio: "",
    education: "",
    experience: "",
    procedures: "",
    availability: "",
    pharmacies: "",
    privateClinic: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setDoctorDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddDoctor = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDoctors([...doctors, doctorDetails]);
    setDoctorDetails({
      name: "",
      specialty: "",
      rating: "",
      reviews: "",
      location: "",
      image: "",
      bio: "",
      education: "",
      experience: "",
      procedures: "",
      availability: "",
      pharmacies: "",
      privateClinic: "",
    });
  };

  return (
    <motion.div
      className="p-6 max-w-4xl mx-auto bg-gray-900 text-gray-100 rounded-lg shadow-md"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-cyan-400 mb-4">
        Manage Doctors for {hospitalName}
      </h2>
      <form onSubmit={handleAddDoctor} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            value={doctorDetails.name}
            onChange={handleChange}
            className="p-2 rounded-lg bg-gray-800 border border-gray-700"
            placeholder="Doctor's Name"
            required
          />
          <input
            type="text"
            name="specialty"
            value={doctorDetails.specialty}
            onChange={handleChange}
            className="p-2 rounded-lg bg-gray-800 border border-gray-700"
            placeholder="Specialty"
            required
          />
          <input
            type="number"
            name="rating"
            value={doctorDetails.rating}
            onChange={handleChange}
            className="p-2 rounded-lg bg-gray-800 border border-gray-700"
            placeholder="Rating (e.g., 4.8)"
          />
          <input
            type="text"
            name="reviews"
            value={doctorDetails.reviews}
            onChange={handleChange}
            className="p-2 rounded-lg bg-gray-800 border border-gray-700"
            placeholder="Reviews (e.g., 128)"
          />
          <input
            type="text"
            name="location"
            value={doctorDetails.location}
            onChange={handleChange}
            className="p-2 rounded-lg bg-gray-800 border border-gray-700"
            placeholder="Location"
            required
          />
          <input
            type="text"
            name="image"
            value={doctorDetails.image}
            onChange={handleChange}
            className="p-2 rounded-lg bg-gray-800 border border-gray-700"
            placeholder="Image URL"
          />
        </div>
        <textarea
          name="bio"
          value={doctorDetails.bio}
          onChange={handleChange}
          className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
          placeholder="Short Bio"
          rows={3}
        />
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            name="education"
            value={doctorDetails.education}
            onChange={handleChange}
            className="p-2 rounded-lg bg-gray-800 border border-gray-700"
            placeholder="Education"
          />
          <input
            type="text"
            name="experience"
            value={doctorDetails.experience}
            onChange={handleChange}
            className="p-2 rounded-lg bg-gray-800 border border-gray-700"
            placeholder="Experience"
          />
        </div>
        <textarea
          name="procedures"
          value={doctorDetails.procedures}
          onChange={handleChange}
          className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
          placeholder="Procedures (comma-separated)"
          rows={2}
        />
        <textarea
          name="availability"
          value={doctorDetails.availability}
          onChange={handleChange}
          className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
          placeholder="Availability (e.g., Mon-Fri: 9:00-17:00)"
          rows={2}
        />
        <textarea
          name="pharmacies"
          value={doctorDetails.pharmacies}
          onChange={handleChange}
          className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
          placeholder="Pharmacies (comma-separated)"
          rows={2}
        />
        <textarea
          name="privateClinic"
          value={doctorDetails.privateClinic}
          onChange={handleChange}
          className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
          placeholder="Private Clinic Details"
          rows={2}
        />
        <button
          type="submit"
          className="w-full cyber-button text-white font-bold py-2 px-4 rounded-lg transition"
        >
          Add Doctor
        </button>
      </form>

      <div className="mt-6">
        <h3 className="text-xl font-semibold text-gray-100">Doctors List</h3>
        <ul className="space-y-3 mt-3">
          {doctors.map((doc, idx) => (
            <motion.li
              key={idx}
              className="p-4 bg-gray-800 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div>
                <h4 className="text-lg font-bold">{doc.name}</h4>
                <p className="text-sm">Specialty: {doc.specialty}</p>
                <p className="text-sm">
                  Rating: {doc.rating} ({doc.reviews} reviews)
                </p>
                <p className="text-sm">Location: {doc.location}</p>
              </div>
              <button
                onClick={() => setDoctors(doctors.filter((_, i) => i !== idx))}
                className="text-red-500 hover:underline mt-2 md:mt-0"
              >
                Remove
              </button>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default DoctorManagement;
