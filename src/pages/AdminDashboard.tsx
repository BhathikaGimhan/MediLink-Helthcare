import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/userStore";
import { db } from "../firebase";
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";
import AdminSidebar from "../components/AdminSidebar";
import AddDoctorForm from "../components/AddDoctorForm";
import EditDoctorForm from "../components/EditDoctorForm";
import AdminDoctorList from "../components/AdminDoctorList";

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

const AdminDashboard = () => {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [medicalCenter, setMedicalCenter] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"dashboard" | "add-doctor" | "edit-doctor">("dashboard");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    const checkAdminAndAssignCenter = async () => {
      if (!user) {
        setError("No user authenticated.");
        navigate("/login");
        return;
      }

      try {
        // Check if user is admin
        const userQuery = query(
          collection(db, "users"),
          where("id", "==", user.id),
          where("role", "==", "admin-1")
        );
        const userDocs = await getDocs(userQuery);
        if (userDocs.empty) {
          setError("Unauthorized access. Admin role required.");
          navigate("/login");
          return;
        }

        // Check for existing medical center
        const centerQuery = query(
          collection(db, "medicalCenters"),
          where("adminId", "==", user.id)
        );
        const centerDocs = await getDocs(centerQuery);

        if (centerDocs.empty) {
          const requestQuery = query(
            collection(db, "medicalCenterRequests"),
            where("userId", "==", user.id),
            where("status", "==", "approved")
          );
          const requestDocs = await getDocs(requestQuery);

          if (!requestDocs.empty) {
            const requestData = requestDocs.docs[0].data();
            const medicalCenterData = {
              name: requestData.centerName,
              adminId: user.id,
              createdAt: new Date().toISOString(),
            };
            const centerRef = doc(collection(db, "medicalCenters"));
            await setDoc(centerRef, medicalCenterData);
            setMedicalCenter({ id: centerRef.id, name: medicalCenterData.name });
          } else {
            setError("No approved medical center request found. Please submit a request.");
            setIsLoading(false);
            return;
          }
        } else {
          const centerData = centerDocs.docs[0].data();
          setMedicalCenter({ id: centerDocs.docs[0].id, name: centerData.name });
        }

        // Fetch doctors
        if (medicalCenter?.id) {
          const doctorsQuery = query(
            collection(db, "doctors"),
            where("medicalCenterId", "==", medicalCenter.id)
          );
          const doctorsDocs = await getDocs(doctorsQuery);
          const doctorsList = doctorsDocs.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Doctor[];
          setDoctors(doctorsList);
        }
      } catch (err: any) {
        console.error("Error in AdminDashboard:", { code: err.code, message: err.message });
        setError(
          err.code === "permission-denied"
            ? "Insufficient permissions to access data. Please ensure your account has the correct access."
            : err.message || "Failed to load dashboard."
        );
      } finally {
        setIsLoading(false);
      }
    };
    checkAdminAndAssignCenter();
  }, [user, navigate, medicalCenter]);

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-900 text-cyan-50 flex"
    >
      {/* Sidebar */}
      <AdminSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        doctors={doctors}
      />

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 sm:pl-12 lg:pl-8">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold neon-text">
              {medicalCenter?.name || "Medical Center"} Admin Dashboard
            </h1>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 bg-red-900/20 border border-red-500/30 p-3 rounded-lg text-center mb-4"
            >
              {error}
            </motion.div>
          )}

          {/* Content */}
          {activeSection === "add-doctor" && (
            <AddDoctorForm
              medicalCenter={medicalCenter}
              setDoctors={setDoctors}
              setError={setError}
            />
          )}
          {activeSection === "edit-doctor" && (
            <EditDoctorForm
              selectedDoctor={selectedDoctor}
              setDoctors={setDoctors}
              setError={setError}
              setActiveSection={setActiveSection}
            />
          )}
          {activeSection === "dashboard" && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="cyber-card p-6 mb-6"
              >
                <h2 className="text-2xl font-bold neon-text mb-4">Admin Details</h2>
                <div className="space-y-2">
                  <p className="text-gray-400">
                    <span className="font-bold">Name:</span> {user?.name || "N/A"}
                  </p>
                  <p className="text-gray-400">
                    <span className="font-bold">Email:</span> {user?.email || "N/A"}
                  </p>
                  <p className="text-gray-400">
                    <span className="font-bold">Role:</span> {user?.role || "N/A"}
                  </p>
                  <p className="text-gray-400">
                    <span className="font-bold">Medical Center:</span>{" "}
                    {medicalCenter?.name || "N/A"}
                  </p>
                </div>
              </motion.div>
              <AdminDoctorList
                doctors={doctors}
                setDoctors={setDoctors}
                setActiveSection={setActiveSection}
                setSelectedDoctor={setSelectedDoctor}
              />
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;