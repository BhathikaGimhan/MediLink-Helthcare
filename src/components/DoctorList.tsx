import { motion } from "framer-motion";

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

interface DoctorListProps {
  doctors: Doctor[];
}

const DoctorList = ({ doctors }: DoctorListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {doctors.map((doctor) => (
        <motion.div
          key={doctor.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="cyber-card p-6"
        >
          <img
            src={doctor.image}
            alt={doctor.name}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
          <h3 className="text-xl font-bold neon-text">{doctor.name}</h3>
          <p className="text-gray-400">{doctor.specialty}</p>
          <p className="text-gray-400">Medical Center: {doctor.medicalCenterName}</p>
          <p className="text-gray-400">
            Rating: {doctor.rating} ({doctor.reviews} reviews)
          </p>
          <p className="text-gray-400">Location: {doctor.location}</p>
          <p className="text-gray-400 mt-2">{doctor.bio}</p>
          <p className="text-gray-400">Education: {doctor.education}</p>
          <p className="text-gray-400">Experience: {doctor.experience}</p>
          <div className="mt-2">
            <p className="text-gray-400 font-bold">Procedures:</p>
            <ul className="list-disc list-inside text-gray-400">
              {doctor.procedures.map((proc, idx) => (
                <li key={idx}>{proc}</li>
              ))}
            </ul>
          </div>
          <div className="mt-2">
            <p className="text-gray-400 font-bold">Availability:</p>
            <p className="text-gray-400">Status: {doctor.availability.status}</p>
            <p className="text-gray-400">Next Slot: {doctor.availability.nextSlot}</p>
            <p className="text-gray-400">
              Schedule: {doctor.availability.schedule.join(", ")}
            </p>
          </div>
          <div className="mt-2">
            <p className="text-gray-400 font-bold">Pharmacies:</p>
            {doctor.pharmacies.map((pharmacy, idx) => (
              <div key={idx} className="text-gray-400">
                <p>{pharmacy.name}</p>
                <p>{pharmacy.address}</p>
                <p>{pharmacy.hours}</p>
                <p>Specialties: {pharmacy.specialties.join(", ")}</p>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <p className="text-gray-400 font-bold">Private Clinic:</p>
            <p className="text-gray-400">{doctor.privateClinic.name}</p>
            <p className="text-gray-400">{doctor.privateClinic.address}</p>
            <p className="text-gray-400">
              Facilities: {doctor.privateClinic.facilities.join(", ")}
            </p>
            <p className="text-gray-400">
              Appointments: {doctor.privateClinic.appointments}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DoctorList;