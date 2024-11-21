import { motion } from "framer-motion";
// import { useParams } from "react-router-dom";
import {
  Star,
  MapPin,
  Award,
  Calendar,
  Clock,
  MessageCircle,
  Pill,
  Store,
} from "lucide-react";

const mockDoctor = {
  id: 1,
  name: "Dr. Sarah Chen",
  specialty: "Neurology",
  rating: 4.8,
  reviews: 128,
  location: "Neo Tokyo Central",
  image:
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300",
  bio: "Specializing in advanced neural pathway reconstruction and cognitive enhancement procedures. Pioneer in cyber-neural integration techniques.",
  education: "Neo Tokyo Medical Academy",
  experience: "15 years",
  procedures: [
    "Neural Remapping",
    "Cognitive Enhancement",
    "Synaptic Optimization",
  ],
  availability: {
    status: "Available",
    nextSlot: "Today, 15:00",
    schedule: ["Mon-Fri: 9:00-17:00", "Sat: 10:00-14:00"],
  },
  pharmacies: [
    {
      name: "NeuroCare Pharmacy",
      address: "123 Cyber Street, Neo Tokyo",
      hours: "24/7",
      specialties: ["Neural Enhancers", "Cognitive Boosters"],
    },
    {
      name: "MindTech Dispensary",
      address: "456 Digital Ave, Neo Tokyo",
      hours: "8:00-22:00",
      specialties: ["Synaptic Stabilizers", "Memory Enhancers"],
    },
  ],
  privateClinic: {
    name: "Chen Neural Institute",
    address: "789 Innovation Park, Neo Tokyo",
    facilities: ["Advanced Neural Scanner", "Cognitive Enhancement Suite"],
    appointments: "By referral only",
  },
};

const DoctorDetails = () => {
  // const { id } = useParams();

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card"
      >
        {/* Doctor's basic info section */}
        <div className="md:flex">
          <div className="md:w-1/3">
            <img
              src={mockDoctor.image}
              alt={mockDoctor.name}
              className="w-full h-64 object-cover md:h-full"
            />
          </div>
          <div className="p-6 md:w-2/3">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">{mockDoctor.name}</h1>
                <div className="flex items-center space-x-2 text-cyan-400 mb-4">
                  <Award className="w-5 h-5" />
                  <span>{mockDoctor.specialty}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center space-x-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="font-bold text-xl">{mockDoctor.rating}</span>
                </div>
                <span
                  className={`text-sm ${
                    mockDoctor.availability.status === "Available"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {mockDoctor.availability.status}
                </span>
              </div>
            </div>

            <p className="text-gray-400 mb-6">{mockDoctor.bio}</p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>{mockDoctor.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>{mockDoctor.experience} experience</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-cyan-400">
                  Next Available Slot:
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>{mockDoctor.availability.nextSlot}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Private Clinic Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="cyber-card p-6"
      >
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Store className="w-5 h-5 mr-2 text-cyan-400" />
          Private Clinic
        </h2>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-cyan-400">
            {mockDoctor.privateClinic.name}
          </h3>
          <p className="text-gray-400">{mockDoctor.privateClinic.address}</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Facilities</h4>
              <ul className="space-y-2">
                {mockDoctor.privateClinic.facilities.map((facility, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                    <span>{facility}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Appointments</h4>
              <p className="text-gray-400">
                {mockDoctor.privateClinic.appointments}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Associated Pharmacies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="cyber-card p-6"
      >
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Pill className="w-5 h-5 mr-2 text-cyan-400" />
          Associated Pharmacies
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {mockDoctor.pharmacies.map((pharmacy, index) => (
            <div key={index} className="space-y-3">
              <h3 className="text-lg font-semibold text-cyan-400">
                {pharmacy.name}
              </h3>
              <p className="text-gray-400">{pharmacy.address}</p>
              <div className="text-sm">
                <span className="text-cyan-400">Hours:</span> {pharmacy.hours}
              </div>
              <div>
                <h4 className="font-semibold mb-2">Specialties</h4>
                <ul className="space-y-1">
                  {pharmacy.specialties.map((specialty, idx) => (
                    <li
                      key={idx}
                      className="text-gray-400 flex items-center space-x-2"
                    >
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                      <span>{specialty}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Booking Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="cyber-card p-6"
      >
        <button className="cyber-button w-full flex items-center justify-center space-x-2">
          <MessageCircle className="w-5 h-5" />
          <span>Schedule Consultation</span>
        </button>
      </motion.div>
    </div>
  );
};

export default DoctorDetails;
