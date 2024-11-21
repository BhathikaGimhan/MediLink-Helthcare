import { useState } from "react";
import Alert from "../components/Alert";
import { AnimatePresence } from "framer-motion";
// Import the Alert component

const ExamplePage = () => {
  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showAlert = (message: string, type: "success" | "error" | "info") => {
    setAlert({ message, type });
  };

  const closeAlert = () => {
    setAlert(null);
  };

  return (
    <div>
      <button
        onClick={() => showAlert("Everything is running smoothly!", "success")}
      >
        Show Success Alert
      </button>
      <button onClick={() => showAlert("Something went wrong!", "error")}>
        Show Error Alert
      </button>
      <button onClick={() => showAlert("Check out the new updates.", "info")}>
        Show Info Alert
      </button>
      <AnimatePresence>
        {alert && (
          <Alert
            message={alert.message}
            type={alert.type}
            onClose={closeAlert}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamplePage;
