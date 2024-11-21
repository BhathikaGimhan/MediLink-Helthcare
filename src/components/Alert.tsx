import { motion } from "framer-motion";
import { X } from "lucide-react";

const Alert = ({ message, type, onClose }) => {
  const typeStyles = {
    success:
      "from-green-500/50 to-green-700/50 text-green-300 border border-green-500",
    error: "from-red-500/50 to-red-700/50 text-red-300 border border-red-500",
    info: "from-cyan-500/50 to-cyan-700/50 text-cyan-300 border border-cyan-500",
  };
  const bgAnimations = {
    success:
      "bg-gradient-to-r from-transparent via-green-500/30  to-transparent ",
    error: "bg-gradient-to-r from-transparent via-red-500/30  to-transparent ",
    info: "bg-gradient-to-r from-transparent via-cyan-500/30  to-transparent ",
  };
  const btnColor = {
    success: "text-green-300 hover:text-green-100",
    error: "text-red-300 hover:text-red-100",
    info: "text-cyan-300 hover:text-cyan-100",
  };
  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
      className={`absolute top-8 right-8 z-50 px-6 py-4 overflow-hidden rounded-lg bg-gradient-to-br ${typeStyles[type]} backdrop-blur-md shadow-lg relative`}
    >
      <div className="flex items-center">
        {/* Alert Icon with Bounce */}
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
          {type === "success" && <span className="text-2xl">✅</span>}
          {type === "error" && <span className="text-2xl">❌</span>}
          {type === "info" && <span className="text-2xl">ℹ️</span>}
        </motion.div>

        {/* Alert Message */}
        <div className="text-lg font-semibold">{message}</div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`ml-5 transition-transform transform hover:scale-110 ${btnColor[type]}`}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

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
