import { useState } from "react";
import HospitalRegistration from "../components/HospitalRegistration";
import DoctorManagement from "../components/DoctorManagement";

const Registration = () => {
  const [hospital, setHospital] = useState<{ name: string } | null>(null);
  return (
    <div>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        {!hospital ? (
          <HospitalRegistration onRegisterHospital={setHospital} />
        ) : (
          <DoctorManagement hospitalName={hospital.name} />
        )}
      </div>
    </div>
  );
};

export default Registration;
