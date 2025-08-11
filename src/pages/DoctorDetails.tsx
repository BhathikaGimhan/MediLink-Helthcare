import React, { useState, useEffect } from "react";
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
  query,
  where,
} from "firebase/firestore";
import { Calendar, Star, MapPin, Briefcase, BookOpen, Pill } from "lucide-react";
import { format } from "date-fns";
import { useUserStore } from "../stores/userStore";
import BookingForm from "./BookingForm";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  ratings: number[];
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
  userName?: string;
}

const DoctorDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hasBooked, setHasBooked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState<number>(0);
  const [newReviewText, setNewReviewText] = useState<string>("");
  const navigate = useNavigate();
  const { user } = useUserStore();

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
            ratings: data.ratings || [],
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
            medicalCenterName: data.medicalCenterName || "Unknown",
          });
        } else {
          setError("Doctor not found.");
        }

        // Fetch bookings to check if user has booked this doctor
        if (user) {
          const bookingsQuery = query(
            collection(db, "bookings"),
            where("userId", "==", user.id),
            where("doctorId", "==", id),
            where("status", "==", "booked")
          );
          const bookingsSnapshot = await getDocs(bookingsQuery);
          setHasBooked(!bookingsSnapshot.empty);
        }

        // Fetch reviews from users who have booked this doctor
        const bookingsQuery = query(
          collection(db, "bookings"),
          where("doctorId", "==", id),
          where("status", "==", "booked")
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const bookedUserIds = bookingsSnapshot.docs.map((doc) => doc.data().userId);

        const reviewsQuery = query(
          collection(db, "reviews"),
          where("doctorId", "==", id),
          where("userId", "in", bookedUserIds.length > 0 ? bookedUserIds : ["none"])
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviewsData: Review[] = reviewsSnapshot.docs.map((doc) => ({
          id: doc.id,
          userId: doc.data().userId,
          doctorId: doc.data().doctorId,
          rating: doc.data().rating,
          reviewText: doc.data().reviewText,
          createdAt: doc.data().createdAt,
          userName: doc.data().userName || "Anonymous",
        }));
        setReviews(reviewsData);
      } catch (err: any) {
        setError(err.message || "Failed to fetch doctor details or reviews.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctorAndReviews();
  }, [id, user]);

  const handleSubmitReview = async () => {
    if (!doctor || !user || !newRating || !newReviewText) {
      setError("Please provide both a rating and a review.");
      return;
    }

    if (!hasBooked) {
      setError("You must book an appointment with this doctor to submit a review.");
      return;
    }

    try {
      const reviewData = {
        userId: user.id,
        doctorId: doctor.id,
        rating: newRating,
        reviewText: newReviewText,
        createdAt: new Date().toISOString(),
        userName: user.displayName || "Anonymous",
      };
      const reviewRef = await addDoc(collection(db, "reviews"), reviewData);

      const doctorRef = doc(db, "doctors", doctor.id);
      const updatedRatings = [...(doctor.ratings || []), newRating];
      const newAverageRating =
        updatedRatings.reduce((sum, rating) => sum + rating, 0) / updatedRatings.length;
      await updateDoc(doctorRef, {
        ratings: arrayUnion(newRating),
        rating: newAverageRating,
        reviews: (doctor.reviews || 0) + 1,
      });

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
                  onClick={() => {
                    if (!user) {
                      navigate("/login");
                      return;
                    }
                    setIsBookingModalOpen(true);
                  }}
                  className="cyber-button flex items-center space-x-2 px-6 py-3"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Book Appointment</span>
                </button>
                {hasBooked && (
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
                )}
              </div>
            </div>
          </div>
        </div>

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
            <p className="text-gray-300">No reviews yet from booked users.</p>
          )}
        </div>

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

        {isBookingModalOpen && user && (
          <BookingForm
            doctor={doctor}
            userId={user.id}
            onClose={() => setIsBookingModalOpen(false)}
          />
        )}

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
              {error && (
                <p className="text-red-400 bg-red-900/20 border border-red-500/30 p-2 rounded-lg mb-4">
                  {error}
                </p>
              )}
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
                    setError(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DoctorDetails;