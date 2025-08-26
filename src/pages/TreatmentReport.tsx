import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { DownloadCloudIcon, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { db } from "../firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { useUserStore } from "../stores/userStore";
import Loader from "../components/Loader";

interface Booking {
  id: string;
  doctorName: string;
  appointmentTime: string;
  medicalCenterName: string;
  location: string;
  status: string;
}

const TreatmentReport = () => {
  const [includeDoctorEvidence, setIncludeDoctorEvidence] = useState(true);
  const [includeTreatmentDetails, setIncludeTreatmentDetails] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [includeDoctorSuggestions, setIncludeDoctorSuggestions] = useState(true);
  const [includeAppointmentDetails, setIncludeAppointmentDetails] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUserStore();

  const reportData = {
    userName: user?.displayName || "John Doe",
    ailment: "Fever, Cough", // Placeholder; ideally fetched from chat history
    suggestedTreatment: "Paracetamol 500mg - 3 times a day", // Placeholder
    doctorSuggestions: [
      { name: "Dr. Smith", specialization: "General Physician", rating: "4.5/5" },
      { name: "Dr. Jane", specialization: "Internal Medicine", rating: "4.2/5" },
    ],
    notes: "Drink plenty of water and rest well.", // Placeholder
    date: new Date().toLocaleDateString(),
  };

  useEffect(() => {
    const fetchLatestBooking = async () => {
      if (!user) return;
      try {
        const bookingsQuery = query(
          collection(db, "bookings"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const querySnapshot = await getDocs(bookingsQuery);
        if (!querySnapshot.empty) {
          const bookingData = querySnapshot.docs[0].data();
          setBooking({
            id: querySnapshot.docs[0].id,
            doctorName: bookingData.doctorName,
            appointmentTime: bookingData.appointmentTime,
            medicalCenterName: bookingData.medicalCenterName,
            location: bookingData.location,
            status: bookingData.status,
          });
        }
      } catch (err) {
        console.error("Error fetching booking:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLatestBooking();
  }, [user]);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("MediLink AI Treatment Report", 20, 20);

    doc.setFontSize(12);
    let yPos = 40;
    
    doc.text(`Name: ${reportData.userName}`, 20, yPos);
    yPos += 10;
    doc.text(`Ailments: ${reportData.ailment}`, 20, yPos);
    yPos += 10;

    if (includeTreatmentDetails) {
      doc.text(`Suggested Treatment: ${reportData.suggestedTreatment}`, 20, yPos);
      yPos += 10;
    }
    if (includeDoctorEvidence && booking) {
      doc.text(`Doctor: ${booking.doctorName}`, 20, yPos);
      yPos += 10;
    }
    if (includeNotes) {
      doc.text(`Notes: ${reportData.notes}`, 20, yPos);
      yPos += 10;
    }
    if (includeDoctorSuggestions) {
      doc.text("Doctor Suggestions:", 20, yPos);
      yPos += 10;
      reportData.doctorSuggestions.forEach((docData, idx) => {
        doc.text(`${idx + 1}. ${docData.name} (${docData.specialization})`, 20, yPos);
        doc.text(`Rating: ${docData.rating}`, 60, yPos + 5);
        yPos += 15;
      });
    }
    if (includeAppointmentDetails && booking) {
      doc.text("Appointment Details:", 20, yPos);
      yPos += 10;
      doc.text(`Doctor: ${booking.doctorName}`, 20, yPos);
      yPos += 10;
      doc.text(`Date & Time: ${booking.appointmentTime}`, 20, yPos);
      yPos += 10;
      doc.text(`Location: ${booking.location}`, 20, yPos);
      yPos += 10;
      doc.text(`Medical Center: ${booking.medicalCenterName}`, 20, yPos);
      yPos += 10;
      doc.text(`Status: ${booking.status}`, 20, yPos);
      yPos += 10;
    }

    doc.text(`Report Date: ${reportData.date}`, 20, yPos);
    doc.save("Treatment_Report.pdf");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-4xl mx-auto bg-gray-900 text-gray-100 rounded-xl space-y-6"
    >
      {/* Header */}
      <h2 className="text-3xl font-bold text-cyan-400 flex items-center space-x-2">
        <FileText className="w-6 h-6" />
        <span>Generate Treatment Report</span>
      </h2>
      <p className="text-sm text-gray-400">
        Customize your report before generating. Real-time preview below.
      </p>

      {/* Toggles for Options */}
      <div className="grid md:grid-cols-2 gap-6">
        {[
          {
            id: 1,
            label: "Include Doctor Evidence",
            state: includeDoctorEvidence,
            setter: setIncludeDoctorEvidence,
          },
          {
            id: 2,
            label: "Include Treatment Details",
            state: includeTreatmentDetails,
            setter: setIncludeTreatmentDetails,
          },
          {
            id: 3,
            label: "Include Notes",
            state: includeNotes,
            setter: setIncludeNotes,
          },
          {
            id: 4,
            label: "Include Doctor Suggestions",
            state: includeDoctorSuggestions,
            setter: setIncludeDoctorSuggestions,
          },
          {
            id: 5,
            label: "Include Appointment Details",
            state: includeAppointmentDetails,
            setter: setIncludeAppointmentDetails,
          },
        ].map(({ id, label, state, setter }) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: id * 0.2 }}
          >
            <div className="flex items-center justify-between">
              <label className="text-sm">{label}:</label>
              <div
                className={`w-10 h-5 rounded-full cursor-pointer ${
                  state ? "bg-cyan-500" : "bg-gray-500 animate-pulse"
                } relative`}
                onClick={() => setter(!state)}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                    state ? "translate-x-5" : "translate-x-1"
                  }`}
                ></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Preview Section */}
      <div className="p-4 bg-gray-800 rounded-xl shadow-md max-h-80 overflow-y-auto space-y-3">
        <h3 className="text-xl font-semibold text-gray-100">Report Preview</h3>
        {isLoading ? (
          <Loader/>
        ) : (
          <div className="text-sm space-y-2">
            <p><strong>Name:</strong> {reportData.userName}</p>
            <p><strong>Ailments:</strong> {reportData.ailment}</p>
            {includeTreatmentDetails && (
              <p><strong>Treatment:</strong> {reportData.suggestedTreatment}</p>
            )}
            {includeDoctorEvidence && booking && (
              <p><strong>Doctor:</strong> {booking.doctorName}</p>
            )}
            {includeNotes && (
              <p><strong>Notes:</strong> {reportData.notes}</p>
            )}
            {includeDoctorSuggestions && (
              <div>
                <strong>Doctor Suggestions:</strong>
                <div className="space-y-2">
                  {reportData.doctorSuggestions.map((doc, idx) => (
                    <div key={idx} className="flex justify-between">
                      <p>{doc.name} ({doc.specialization})</p>
                      <p>Rating: {doc.rating}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {includeAppointmentDetails && booking && (
              <div>
                <strong>Appointment Details:</strong>
                <div className="space-y-2">
                  <p>Doctor: {booking.doctorName}</p>
                  <p>Date & Time: {booking.appointmentTime}</p>
                  <p>Location: {booking.location}</p>
                  <p>Medical Center: {booking.medicalCenterName}</p>
                  <p>Status: {booking.status}</p>
                </div>
              </div>
            )}
            <p><strong>Date:</strong> {reportData.date}</p>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <button
        onClick={generatePDF}
        className="w-full flex justify-center gap-5 items-center cyber-button py-2 px-4 rounded-lg transition"
      >
        <DownloadCloudIcon /> Generate PDF Report
      </button>
    </motion.div>
  );
};

export default TreatmentReport;