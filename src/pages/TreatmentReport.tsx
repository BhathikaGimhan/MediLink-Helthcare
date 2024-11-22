import { useState } from "react";
import jsPDF from "jspdf";
import { FileText } from "lucide-react";

const TreatmentReport = () => {
  const [includeDoctorEvidence, setIncludeDoctorEvidence] = useState(true);
  const [includeTreatmentDetails, setIncludeTreatmentDetails] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [includeDoctorSuggestions, setIncludeDoctorSuggestions] =
    useState(true);
  const [includeAppointmentDetails, setIncludeAppointmentDetails] =
    useState(true);

  const reportData = {
    userName: "John Doe",
    ailment: "Fever, Cough",
    suggestedTreatment: "Paracetamol 500mg - 3 times a day",
    doctorSuggestions: [
      {
        name: "Dr. Smith",
        specialization: "General Physician",
        rating: "4.5/5",
      },
      {
        name: "Dr. Jane",
        specialization: "Internal Medicine",
        rating: "4.2/5",
      },
    ],
    doctorChanneling: "Dr. Smith - General Physician",
    notes: "Drink plenty of water and rest well.",
    appointmentDetails: [
      { date: "2024-11-20", time: "10:00 AM", location: "City Clinic" },
    ],
    date: "22nd Nov 2024",
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("MediLink AI Treatment Report", 10, 10);

    doc.setFontSize(12);
    doc.text(`Name: ${reportData.userName}`, 10, 30);
    doc.text(`Ailments: ${reportData.ailment}`, 10, 40);

    let yPos = 50;
    if (includeTreatmentDetails) {
      doc.text(
        `Suggested Treatment: ${reportData.suggestedTreatment}`,
        10,
        yPos
      );
      yPos += 10;
    }
    if (includeDoctorEvidence) {
      doc.text(`Doctor Evidence: ${reportData.doctorChanneling}`, 10, yPos);
      yPos += 10;
    }
    if (includeNotes) {
      doc.text(`Notes: ${reportData.notes}`, 10, yPos);
      yPos += 10;
    }

    // Add Doctor Suggestions Table
    if (includeDoctorSuggestions) {
      doc.text("Doctor Suggestions:", 10, yPos);
      yPos += 10;
      reportData.doctorSuggestions.forEach((docData, idx) => {
        doc.text(
          `${idx + 1}. ${docData.name} (${docData.specialization})`,
          10,
          yPos
        );
        doc.text(`Rating: ${docData.rating}`, 50, yPos + 10);
        yPos += 20;
      });
    }

    // Add Appointment Details Table
    if (includeAppointmentDetails) {
      doc.text("Appointment Details:", 10, yPos);
      yPos += 10;
      reportData.appointmentDetails.forEach((appt) => {
        doc.text(`Date: ${appt.date}`, 10, yPos);
        doc.text(`Time: ${appt.time}`, 50, yPos + 10);
        doc.text(`Location: ${appt.location}`, 10, yPos + 20);
        yPos += 30;
      });
    }

    doc.text(`Date: ${reportData.date}`, 10, yPos + 10);
    doc.save("Treatment_Report.pdf");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-900 text-gray-100 rounded-lg shadow-md space-y-6 animate-fade-in">
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
            label: "Include Doctor Evidence",
            state: includeDoctorEvidence,
            setter: setIncludeDoctorEvidence,
          },
          {
            label: "Include Treatment Details",
            state: includeTreatmentDetails,
            setter: setIncludeTreatmentDetails,
          },
          {
            label: "Include Notes",
            state: includeNotes,
            setter: setIncludeNotes,
          },
          {
            label: "Include Doctor Suggestions",
            state: includeDoctorSuggestions,
            setter: setIncludeDoctorSuggestions,
          },
          {
            label: "Include Appointment Details",
            state: includeAppointmentDetails,
            setter: setIncludeAppointmentDetails,
          },
        ].map(({ label, state, setter }) => (
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
        ))}
      </div>

      {/* Preview Section */}
      <div className="p-4 bg-gray-800 rounded-lg shadow-md space-y-3">
        <h3 className="text-xl font-semibold text-gray-100">Report Preview</h3>
        <div className="text-sm space-y-2">
          <p>
            <strong>Name:</strong> {reportData.userName}
          </p>
          <p>
            <strong>Ailments:</strong> {reportData.ailment}
          </p>
          {includeTreatmentDetails && (
            <p>
              <strong>Treatment:</strong> {reportData.suggestedTreatment}
            </p>
          )}
          {includeDoctorEvidence && (
            <p>
              <strong>Doctor Evidence:</strong> {reportData.doctorChanneling}
            </p>
          )}
          {includeNotes && (
            <p>
              <strong>Notes:</strong> {reportData.notes}
            </p>
          )}

          {includeDoctorSuggestions && (
            <div>
              <strong>Doctor Suggestions:</strong>
              <div className="space-y-2">
                {reportData.doctorSuggestions.map((doc, idx) => (
                  <div key={idx} className="flex justify-between">
                    <p>
                      {doc.name} ({doc.specialization})
                    </p>
                    <p>Rating: {doc.rating}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {includeAppointmentDetails && (
            <div>
              <strong>Appointment Details:</strong>
              <div className="space-y-2">
                {reportData.appointmentDetails.map((appt, idx) => (
                  <div key={idx} className="flex justify-between">
                    <p>Date: {appt.date}</p>
                    <p>Time: {appt.time}</p>
                    <p>Location: {appt.location}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p>
            <strong>Date:</strong> {reportData.date}
          </p>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generatePDF}
        className="w-full cyber-button py-2 px-4 rounded-lg transition"
      >
        Generate PDF Report
      </button>
    </div>
  );
};

export default TreatmentReport;
