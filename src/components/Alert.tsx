import { motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  MonitorCheck,
  MonitorDotIcon,
  MonitorX,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

type AlertProps = {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
};

const Alert: React.FC<AlertProps> = ({ message, type, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const typeStyles: Record<string, string> = {
    success:
      "from-green-500/20 to-green-700/20 text-green-300 border border-green-500",
    error: "from-red-500/20 to-red-700/20 text-red-300 border border-red-500",
    info: "from-cyan-500/20 to-cyan-700/20 text-cyan-300 border border-cyan-500",
  };

  const bgAnimations: Record<string, string> = {
    success:
      "bg-gradient-to-r from-transparent via-green-500/30 to-transparent ",
    error: "bg-gradient-to-r from-transparent via-red-500/30 to-transparent ",
    info: "bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent ",
  };

  const btnColor: Record<string, string> = {
    success: "text-green-300 hover:text-green-100",
    error: "text-red-300 hover:text-red-100",
    info: "text-cyan-300 hover:text-cyan-100",
  };
  const prograssBar: Record<string, string> = {
    success: "bg-gradient-to-r from-green-400 to-transparent ",
    error: "bg-gradient-to-r from-red-400 to-transparent ",
    info: "bg-gradient-to-r from-cyan-400 to-transparent ",
  };

  // Auto-close alert after 5 seconds unless hovered
  useEffect(() => {
    if (!isHovered) {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            onClose();
            return 0;
          }
          return prev - 2; // Decrease progress
        });
      }, 100);

      return () => clearInterval(timer); // Clean up the timer on unmount
    }
  }, [isHovered, onClose]);

  const [progress, setProgress] = useState(100);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.8 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`absolute top-20 w-96 right-8 z-50 px-6 py-4 overflow-hidden rounded-lg bg-gradient-to-br ${typeStyles[type]} backdrop-blur-lg shadow-lg`}
    >
      <div className="flex items-center">
        {/* Alert Icon */}
        <motion.div
          className="mr-4"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut",
          }}
        >
          {type === "success" && (
            <MonitorCheck className="w-6 h-6 text-green-300" />
          )}
          {type === "error" && <MonitorX className="w-6 h-6 text-red-300" />}
          {type === "info" && (
            <MonitorDotIcon className="w-6 h-6 text-cyan-300" />
          )}
        </motion.div>

        {/* Alert Message */}
        <div className="text-lg font-semibold overflow-hidden">
          {isExpanded ? message : message.substring(0, 50) + "..."}{" "}
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className={`ml-5 transition-transform transform hover:scale-110 ${btnColor[type]}`}
        >
          {isExpanded ? (
            <ChevronUp className="w-6 h-6" />
          ) : (
            <ChevronDown className="w-6 h-6" />
          )}
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`ml-5 transition-transform transform hover:scale-110 ${btnColor[type]}`}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Progress Bar */}
      <div
        className={`absolute bottom-0  h-[5px] left-0 w-full bg-transparent ${prograssBar[type]}`}
        style={{
          width: `${progress}%`,
          transition: "width 0.1s ease",
        }}
      />
      <div
        className={`absolute inset-0 ${bgAnimations[type]} `}
        style={{
          transform: "translateX(-100%)",
          animation: "slide-highlight 2s linear infinite",
        }}
      />
    </motion.div>
  );
};

export default Alert;
