import { useState } from "react";
import Alert from "../components/Alert";
import { AnimatePresence } from "framer-motion";
// Import the Alert component
type AlertType = {
  message: string;
  type: "success" | "error" | "info"; // Adjust the type based on your use case
} | null;

const ExamplePage = () => {
  const [alert, setAlert] = useState<AlertType>(null);

  const showAlert = (message: string, type: "success" | "error" | "info") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000); // Auto-dismiss after 5 seconds
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-cyan-400 mb-6">
        Cyberpunk Alerts
      </h1>
      <div className="space-x-4">
        <button
          onClick={() => showAlert("All systems operational!", "success")}
          className="cyber-button"
        >
          Success
        </button>
        <button
          onClick={() => showAlert("An error occurred!", "error")}
          className="cyber-button"
        >
          Error
        </button>
        <button
          onClick={() => showAlert("New update available.", "info")}
          className="cyber-button"
        >
          Info
        </button>
      </div>

      <AnimatePresence>
        {alert && (
          <Alert
            key={alert.message} // Helps framer-motion manage animations
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamplePage;
