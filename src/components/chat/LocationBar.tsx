import { motion } from "framer-motion";
import { MapPin, DownloadCloud } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

interface LocationBarProps {
  location: string;
  setLocation: (value: string) => void;
}

const districts = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Monaragala",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya",
];

const LocationBar: React.FC<LocationBarProps> = ({ location, setLocation }) => {
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  // Function to fetch district from coordinates using Google Maps Geocoding API
  const getDistrictFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const apiKey = "AIzaSyBD_aOnEig3WlB-d6vahalfQPkWEDq0Wgk"; // Replace with your Google API key
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
      );
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        // Find the district (administrative_area_level_2 is typically the district in Sri Lanka)
        const districtComponent = data.results.find((result: any) =>
          result.types.includes("administrative_area_level_2")
        );
        if (districtComponent) {
          const districtName = districtComponent.address_components[0].long_name;
          // Check if the detected district is in the list, otherwise fallback
          if (districts.includes(districtName)) {
            setLocation(districtName); // Auto-select the district
          } else {
            setLocation(""); // Reset if not matching
            setLocationError("හඳුනාගත් දිස්ත්‍රික්කය අපගේ ලැයිස්තුවේ නැත. කරුණාකර තෝරන්න.");
          }
          setLocationError(null);
        } else {
          setLocationError("ඔබේ දිස්ත්‍රික්කය හඳුනාගත නොහැකි වුණා. කරුණාකර තෝරන්න.");
        }
      } else {
        setLocationError("ස්ථානය හඳුනාගැනීමට අපහසු වුණා. කරුණාකර තෝරන්න.");
      }
    } catch (err) {
      console.error("Error during reverse geocoding:", err);
      setLocationError("ස්ථානය හඳුනාගැනීමට අපහසු වුණා. කරුණාකර තෝරන්න.");
    } finally {
      setIsDetecting(false);
    }
  };

  // Function to get user's location using Geolocation API
  const detectLocation = () => {
    if (navigator.geolocation) {
      setIsDetecting(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          getDistrictFromCoordinates(latitude, longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError(
            error.code === error.PERMISSION_DENIED
              ? "ස්ථාන බලපත්‍රය ලබාදීම ප්‍රතික්ෂේප කර ඇත. කරුණාකර ඔබේ දිස්ත්‍රික්කය තෝරන්න."
              : "ස්ථානය හඳුනාගැනීමට අපහසු වුණා. කරුණාකර ඔබේ දිස්ත්‍රික්කය තෝරන්න."
          );
          setIsDetecting(false);
        },
        { timeout: 10000 }
      );
    } else {
      setLocationError("ඔබේ බ්‍රවුසරය ස්ථාන හඳුනාගැනීමට සහය නොදක්වයි.");
      setIsDetecting(false);
    }
  };

  // Auto-detect location on component mount (optional)
  useEffect(() => {
    // Uncomment the line below to auto-detect location when the component mounts
    // detectLocation();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card p-4"
    >
      <div className="flex items-center overflow-x-auto space-x-4">
        <div className="location flex items-center space-x-4">
          <MapPin className="w-5 h-5 text-cyan-400" />
          <select
            className="flex-1 max-sm:flex max-sm:w-28 px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">Select your district...</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
          <button
            className="cyber-button flex items-center justify-center space-x-2"
            onClick={detectLocation}
            disabled={isDetecting}
          >
            <MapPin className="w-4 h-4" />
            <span>{isDetecting ? "Detecting..." : "Detect Location"}</span>
          </button>
        </div>
        <Link to="/report">
          <div className="export-pdf flex items-center space-x-4 cyber-button">
            <DownloadCloud className="w-5 h-5 text-cyan-400" />
            <span>Export PDF</span>
          </div>
        </Link>
      </div>
      {locationError && (
        <p className="text-red-400 text-sm mt-2">{locationError}</p>
      )}
    </motion.div>
  );
};

export default LocationBar;