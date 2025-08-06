import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  updateDoc,
  arrayUnion,
  getDocs,
} from "firebase/firestore";
import { Calendar, Star, MapPin, Briefcase, BookOpen, Pill } from "lucide-react";
import { format } from "date-fns";
import { useUserStore } from "../stores/userStore";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  ratings: number[]; // Array to store individual ratings
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

interface Review {
  id: string;
  userId: string;
  doctorId: string;
  rating: number;
  reviewText: string;
  createdAt: string;
  userName?: string; // Optional: Store user's display name
}

const DoctorDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState<number>(0);
  const [newReviewText, setNewReviewText] = useState<string>("");
  const navigate = useNavigate();
  const { user } = useUserStore();

  // Fetch doctor and reviews
  useEffect(() => {
    const fetchDoctorAndReviews = async () => {
      if (!id) {
        setError("No doctor ID provided.");
        setIsLoading(false);
        return;
      }
      try {
        // Fetch doctor details
        const docRef = doc(db, "doctors", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDoctor({
            id: docSnap.id,
            name: data.name || "Dr. Unknown",
            specialty: data.specialty || "Unknown Specialty",
            rating: data.rating || 0,
            reviews: data.reviews || 0,
            ratings: data.ratings || [], // Initialize ratings array
            location: data.location || "Unknown Location",
            image: data.image || "https://via.placeholder.com/300",
            bio: data.bio || "No bio available.",
            education: data.education || "No education details available.",
            experience: data.experience || "No experience details available.",
            procedures: data.procedures || [],
            availability: {
              status: data.availability?.status || "Unknown",
              nextSlot: data.availability?.nextSlot || "Not available",
              schedule: data.availability?.schedule || [],
            },
            pharmacies: data.pharmacies || [],
            privateClinic: {
              name: data.privateClinic?.name || "No clinic name",
              address: data.privateClinic?.address || "No address",
              facilities: data.privateClinic?.facilities || [],
              appointments: data.privateClinic?.appointments || "Not available",
            },
            medicalCenterId: data.medicalCenterId || "",
            medicalCenterName: data.medicalCenterName || "",
          });
        } else {
          setError("Doctor not found.");
        }

        // Fetch reviews
        const reviewsQuery = collection(db, "reviews");
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviewsData: Review[] = [];
        reviewsSnapshot.forEach((doc) => {
          const reviewData = doc.data();
          if (reviewData.doctorId === id) {
            reviewsData.push({
              id: doc.id,
              userId: reviewData.userId,
              doctorId: reviewData.doctorId,
              rating: reviewData.rating,
              reviewText: reviewData.reviewText,
              createdAt: reviewData.createdAt,
              userName: reviewData.userName || "Anonymous",
            });
          }
        });
        setReviews(reviewsData);
      } catch (err: any) {
        setError(err.message || "Failed to fetch doctor details or reviews.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctorAndReviews();
  }, [id]);

  const handleBookAppointment = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setIsBookingModalOpen(true);
  };

  const confirmBooking = async () => {
    if (!doctor || !selectedSlot || !user) return;

    try {
      await addDoc(collection(db, "bookings"), {
        userId: user.uid,
        doctorId: doctor.id,
        doctorName: doctor.name,
        appointmentTime: selectedSlot,
        status: "confirmed",
        createdAt: new Date().toISOString(),
        medicalCenterName: doctor.medicalCenterName,
        location: doctor.location,
      });
      setIsBookingModalOpen(false);
      setSelectedSlot("");
      alert("Appointment booked successfully!");
      navigate("/appointments");
    } catch (err: any) {
      setError("Failed to book appointment. Please try again.");
      console.error(err);
    }
  };

  const handleSubmitReview = async () => {
    if (!doctor || !user || !newRating || !newReviewText) {
      setError("Please provide both a rating and a review.");
      return;
    }

    try {
      // Add review to reviews collection
      const reviewData = {
        userId: user.uid,
        doctorId: doctor.id,
        rating: newRating,
        reviewText: newReviewText,
        createdAt: new Date().toISOString(),
        userName: user.displayName || "Anonymous",
      };
      const reviewRef = await addDoc(collection(db, "reviews"), reviewData);

      // Update doctor's ratings and average rating
      const doctorRef = doc(db, "doctors", doctor.id);
      const updatedRatings = [...(doctor.ratings || []), newRating];
      const newAverageRating =
        updatedRatings.reduce((sum, rating) => sum + rating, 0) / updatedRatings.length;
      await updateDoc(doctorRef, {
        ratings: arrayUnion(newRating),
        rating: newAverageRating,
        reviews: (doctor.reviews || 0) + 1,
      });

      // Update local state
      setDoctor({
        ...doctor,
        ratings: updatedRatings,
        rating: newAverageRating,
        reviews: doctor.reviews + 1,
      });
      setReviews([
        ...reviews,
        {
          id: reviewRef.id,
          ...reviewData,
        },
      ]);
      setNewRating(0);
      setNewReviewText("");
      setIsReviewModalOpen(false);
      alert("Review submitted successfully!");
    } catch (err: any) {
      setError("Failed to submit review. Please try again.");
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-cyan-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-cyan-50">
        <div className="text-red-400 bg-red-900/20 border border-red-500/30 p-4 rounded-lg text-center">
          {error || "Doctor not found."}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-900 text-cyan-50 p-4 md:p-8"
    >
      <div className="container mx-auto max-w-5xl">
        {/* Hero Section */}
        <div className="cyber-card bg-gray-800/80 backdrop-blur-sm p-8 rounded-xl border border-cyan-500/30 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="relative"
            >
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-full h-80 object-cover rounded-xl border border-cyan-400/50"
              />
              <div className="absolute top-4 left-4 bg-cyan-500/80 text-white px-3 py-1 rounded-full text-sm">
                {doctor.specialty}
              </div>
            </motion.div>
            <div className="md:col-span-2 space-y-4">
              <h1 className="text-4xl font-bold neon-text text-cyan-400">{doctor.name}</h1>
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin className="w-5 h-5" />
                <span>
                  {doctor.location} | {doctor.medicalCenterName}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-yellow-400">
                <Star className="w-5 h-5" />
                <span>
                  {doctor.rating.toFixed(1)} ({doctor.reviews} reviews)
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed">{doctor.bio}</p>
              <div className="flex space-x-4">
                <button
                  onClick={handleBookAppointment}
                  className="cyber-button flex items-center space-x-2 px-6 py-3"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Book Appointment</span>
                </button>
                <button
                  onClick={() => {
                    if (!user) {
                      navigate("/login");
                      return;
                    }
                    setIsReviewModalOpen(true);
                  }}
                  className="cyber-button flex items-center space-x-2 px-6 py-3"
                >
                  <Star className="w-5 h-5" />
                  <span>Add Review</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 cyber-card p-6 rounded-xl border border-cyan-500/30">
          <h2 className="text-2xl font-bold neon-text text-cyan-400 mb-4">Reviews</h2>
          {reviews.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-cyan-500/20 pb-4">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400">{review.rating}/5</span>
                    <span className="text-gray-400">by {review.userName}</span>
                  </div>
                  <p className="text-gray-300 mt-2">{review.reviewText}</p>
                  <p className="text-gray-500 text-sm">
                    {format(new Date(review.createdAt), "MMM dd, yyyy")}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-300">No reviews yet.</p>
          )}
        </div>

        {/* Other Sections (Education, Procedures, Availability, Pharmacies, Private Clinic) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="cyber-card p-6 rounded-xl border border-cyan-500/30">
            <h2 className="text-2xl font-bold neon-text text-cyan-400 mb-4">Education & Experience</h2>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-start space-x-2">
                <BookOpen className="w-5 h-5 mt-1" />
                <div>
                  <p className="font-semibold">Education</p>
                  <p>{doctor.education}</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Briefcase className="w-5 h-5 mt-1" />
                <div>
                  <p className="font-semibold">Experience</p>
                  <p>{doctor.experience}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="cyber-card p-6 rounded-xl border border-cyan-500/30">
            <h2 className="text-2xl font-bold neon-text text-cyan-400 mb-4">Procedures</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              {doctor.procedures.map((proc, idx) => (
                <li key={idx}>{proc}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 cyber-card p-6 rounded-xl border border-cyan-500/30">
          <h2 className="text-2xl font-bold neon-text text-cyan-400 mb-4">Availability</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-300">
            <div>
              <p className="font-semibold">Status</p>
              <p>{doctor.availability.status}</p>
            </div>
            <div>
              <p className="font-semibold">Next Slot</p>
              <p>{doctor.availability.nextSlot}</p>
            </div>
            <div>
              <p className="font-semibold">Schedule</p>
              <p>{doctor.availability.schedule.join(", ")}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 cyber-card p-6 rounded-xl border border-cyan-500/30">
          <h2 className="text-2xl font-bold neon-text text-cyan-400 mb-4">Pharmacies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
            {doctor.pharmacies.map((pharmacy, idx) => (
              <div key={idx}>
                <p className="font-semibold">{pharmacy.name}</p>
                <p>{pharmacy.address}</p>
                <p>Hours: {pharmacy.hours}</p>
                <p>Specialties: {pharmacy.specialties.join(", ")}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 cyber-card p-6 rounded-xl border border-cyan-500/30">
          <h2 className="text-2xl font-bold neon-text text-cyan-400 mb-4">Private Clinic</h2>
          <div className="text-gray-300 space-y-2">
            <p>
              <span className="font-semibold">Name:</span> {doctor.privateClinic.name}
            </p>
            <p>
              <span className="font-semibold">Address:</span> {doctor.privateClinic.address}
            </p>
            <p>
              <span className="font-semibold">Facilities:</span>{" "}
              {doctor.privateClinic.facilities.join(", ")}
            </p>
            <p>
              <span className="font-semibold">Appointments:</span>{" "}
              {doctor.privateClinic.appointments}
            </p>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div className="cyber-card bg-gray-800 p-6 rounded-xl max-w-md w-full">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              Book Appointment with {doctor.name}
            </h2>
            <p className="text-gray-300 mb-4">Select a time slot:</p>
            <select
              className="w-full bg-gray-700 text-gray-100 p-2 rounded-lg border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
            >
              <option value="">Select a time slot</option>
              {doctor.availability.schedule.map((slot, idx) => (
                <option key={idx} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
            <div className="flex space-x-4 mt-4">
              <button
                className="cyber-button flex-1"
                onClick={confirmBooking}
                disabled={!selectedSlot}
              >
                Confirm Booking
              </button>
              <button
                className="cyber-button bg-gray-600 flex-1"
                onClick={() => setIsBookingModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div className="cyber-card bg-gray-800 p-6 rounded-xl max-w-md w-full">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              Add Review for {doctor.name}
            </h2>
            <p className="text-gray-300 mb-4">Rate and write your review:</p>
            <div className="flex items-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 cursor-pointer ${
                    star <= newRating ? "text-yellow-400" : "text-gray-500"
                  }`}
                  onClick={() => setNewRating(star)}
                />
              ))}
            </div>
            <textarea
              className="w-full bg-gray-700 text-gray-100 p-2 rounded-lg border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
              rows={4}
              placeholder="Write your review..."
              value={newReviewText}
              onChange={(e) => setNewReviewText(e.target.value)}
            />
            <div className="flex space-x-4 mt-4">
              <button
                className="cyber-button flex-1"
                onClick={handleSubmitReview}
                disabled={!newRating || !newReviewText}
              >
                Submit Review
              </button>
              <button
                className="cyber-button bg-gray-600 flex-1"
                onClick={() => {
                  setNewRating(0);
                  setNewReviewText("");
                  setIsReviewModalOpen(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DoctorDetails;