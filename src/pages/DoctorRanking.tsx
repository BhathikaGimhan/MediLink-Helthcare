import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Stethoscope } from "lucide-react";

// Define Doctor interface matching the database structure
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
  conditions: string[];
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
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");

  // Fetch doctors from Firestore
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorsCollection = collection(db, "doctors");
        const doctorsSnapshot = await getDocs(doctorsCollection);
        const doctorsList = doctorsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Ensure conditions is always an array
          conditions: Array.isArray(doc.data().conditions) ? doc.data().conditions : [],
          // Ensure specialty and location are strings
          specialty: doc.data().specialty || "Unknown",
          location: doc.data().location || "Unknown",
        })) as Doctor[];

        console.log("Fetched doctors:", doctorsList); // Debug log
        setDoctors(doctorsList);
        setFilteredDoctors(doctorsList);
      } catch (err: any) {
        console.error("Error fetching doctors:", err); // Debug log
        setError(err.message || "Failed to fetch doctors.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Search algorithm implementation
  useEffect(() => {
    // Filter doctors based on search criteria
    const filterDoctors = () => {
      let result = [...doctors];

      // Search by name (case-insensitive)
      if (searchQuery) {
        result = result.filter((doctor) =>
          doctor.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Filter by specialty
      if (selectedSpecialty) {
        result = result.filter(
          (doctor) => doctor.specialty.toLowerCase() === selectedSpecialty.toLowerCase()
        );
      }

      // Filter by location
      if (selectedLocation) {
        result = result.filter(
          (doctor) => doctor.location.toLowerCase() === selectedLocation.toLowerCase()
        );
      }

      // Filter by condition
      if (selectedCondition) {
        result = result.filter((doctor) =>
          doctor.conditions.some((condition) =>
            condition.toLowerCase().includes(selectedCondition.toLowerCase())
          )
        );
      }

      // Sort by rating (descending)
      result.sort((a, b) => b.rating - a.rating);

      setFilteredDoctors(result);
    };

    filterDoctors();
  }, [searchQuery, selectedSpecialty, selectedLocation, selectedCondition, doctors]);

  // Get unique specialties, locations, and conditions for dropdowns
  // Use empty arrays as fallback and validate data
  const specialties = doctors.length
    ? Array.from(
        new Set(
          doctors
            .filter((doctor) => typeof doctor.specialty === "string")
            .map((doctor) => doctor.specialty)
        )
      ).sort()
    : [];
  const locations = doctors.length
    ? Array.from(
        new Set(
          doctors
            .filter((doctor) => typeof doctor.location === "string")
            .map((doctor) => doctor.location)
        )
      ).sort()
    : [];
  const conditions = doctors.length
    ? Array.from(
        new Set(
          doctors
            .filter((doctor) => Array.isArray(doctor.conditions))
            .flatMap((doctor) => doctor.conditions)
        )
      ).sort()
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-cyan-50">
        Loading...
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
        <h1 className="text-4xl font-bold neon-text mb-8 text-center">Find a Doctor</h1>

        {/* Search and Filter Controls */}
        <div className="mb-8 flex space-y-4">
          {/* Name Search Input */}
          <input
            type="text"
            placeholder="Search by doctor name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 text-cyan-50 border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          {/* Specialty Filter */}
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 text-cyan-50 border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            disabled={specialties.length === 0}
          >
            <option value="">All Specialties</option>
            {specialties.map((specialty, index) => (
              <option key={`specialty-${index}`} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>

          {/* Location Filter */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 text-cyan-50 border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            disabled={locations.length === 0}
          >
            <option value="">All Locations</option>
            {locations.map((location, index) => (
              <option key={`location-${index}`} value={location}>
                {location}
              </option>
            ))}
          </select>

          {/* Condition Filter */}
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 text-cyan-50 border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            disabled={conditions.length === 0}
          >
            <option value="">All Conditions</option>
            {conditions.map((condition, index) => (
              <option key={`condition-${index}`} value={condition}>
                {condition}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 bg-red-900/20 border border-red-500/30 p-3 rounded-lg text-center mb-4"
          >
            {error}
          </motion.div>
        )}

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <Link key={doctor.id} to={`/doctors/details/${doctor.id}`}>
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
                      <li key={`procedure-${idx}`}>{proc}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2">
                  <p className="text-gray-400 font-bold">Conditions:</p>
                  <ul className="list-disc list-inside text-gray-400">
                    {doctor.conditions.map((condition, idx) => (
                      <li key={`condition-${idx}`}>{condition}</li>
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

        {/* No Results Message */}
        {filteredDoctors.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            No doctors found matching your criteria. Try adjusting your search filters.
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DoctorRanking;