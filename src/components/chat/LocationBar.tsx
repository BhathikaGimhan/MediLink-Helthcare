import { motion } from "framer-motion";
import { MapPin, DownloadCloud } from "lucide-react";
import { Link } from "react-router-dom";

interface LocationBarProps {
  location: string;
  setLocation: (value: string) => void;
}

const LocationBar: React.FC<LocationBarProps> = ({ location, setLocation }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="cyber-card p-4"
  >
    <div className="flex items-center overflow-x-auto space-x-4">
      <div className="location flex items-center space-x-4">
        <MapPin className="w-5 h-5 text-cyan-400" />
        <input
          type="text"
          placeholder="Enter your location..."
          className="flex-1 max-sm:flex max-sm:w-28 px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <Link to="/report">
        <div className="export-pdf flex items-center space-x-4 cyber-button">
          <DownloadCloud className="w-5 h-5 text-cyan-400" />
          <span>Export PDF</span>
        </div>
      </Link>
    </div>
  </motion.div>
);

export default LocationBar;