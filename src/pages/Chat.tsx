import { motion } from "framer-motion";
import { format } from "date-fns";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import Sidebar from "../components/chat/Sidebar";
import LocationBar from "../components/chat/LocationBar";
import ChatMessageComponent from "../components/chat/ChatMessageComponent";
import ChatInput from "../components/chat/ChatInput";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/userStore";
import { useState, useEffect } from "react";

export interface Doctor {
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
  conditions: string[];
  availability: {
    status: string;
    nextSlot: string;
    schedule: string[];
  };
  pharmacies: { name: string; address: string; hours: string; specialties: string[] }[];
  privateClinic: { name: string; address: string; facilities: string[]; appointments: string };
  medicalCenterId: string;
  medicalCenterName: string;
}

export interface ChatSession {
  id: string;
  date: string;
  preview: string;
}

export interface ChatMessage {
  id: number;
  type: "bot" | "user";
  content: string;
  timestamp: string;
}

const mockSessions: ChatSession[] = [
  { id: "1", date: "2024-03-10", preview: "Consultation about neural enhancement..." },
  { id: "2", date: "2024-03-08", preview: "Questions about cognitive therapy..." },
];

const ChatHistory: React.FC = () => {
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState("");
  const [activeSession, setActiveSession] = useState<string>("1");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [chats, setChats] = useState<ChatMessage[]>([
    {
      id: 1,
      type: "bot",
      content: "ආයුබෝවන්! මම MediLink AI, ඔබේ හිතවත් සෞඛ්‍ය උපදේශකයා. අද ඔබට තියෙන රෝග ලක්ෂණ මොනවාද?",
      timestamp: format(new Date(), "hh:mm a"),
    },
  ]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [lastCondition, setLastCondition] = useState<string>("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestedDoctors, setSuggestedDoctors] = useState<Doctor[]>([]);
  const [currentDoctorIndex, setCurrentDoctorIndex] = useState<number>(0);
  const [isCollectingSymptoms, setIsCollectingSymptoms] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorsCollection = collection(db, "doctors");
        const doctorsSnapshot = await getDocs(doctorsCollection);
        const doctorsList = doctorsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || "Unknown",
            specialty: data.specialty || "Unknown",
            rating: data.rating || 0,
            reviews: data.reviews || 0,
            location: data.location || "Unknown",
            image: data.image || "",
            bio: data.bio || "",
            education: data.education || "",
            experience: data.experience || "",
            procedures: Array.isArray(data.procedures) ? data.procedures : [],
            conditions: Array.isArray(data.conditions) ? data.conditions : [],
            availability: data.availability || { status: "", nextSlot: "", schedule: [] },
            pharmacies: Array.isArray(data.pharmacies) ? data.pharmacies : [],
            privateClinic: data.privateClinic || { name: "", address: "", facilities: [], appointments: "" },
            medicalCenterId: data.medicalCenterId || "",
            medicalCenterName: data.medicalCenterName || "",
          } as Doctor;
        });
        setDoctors(doctorsList);
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError("වෛද්‍යවරුන්ගේ තොරතුරු ලබා ගැනීමට අපහසු වුණා. කරුණාකර පසුව උත්සාහ කරන්න.");
      } finally {
        setIsLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  const updateDoctorMedicalCenterId = async (doctorId: string, newMedicalCenterId: string) => {
    try {
      const doctorRef = doc(db, "doctors", doctorId);
      await updateDoc(doctorRef, {
        medicalCenterId: newMedicalCenterId,
      });
      setDoctors((prevDoctors) =>
        prevDoctors.map((doctor) =>
          doctor.id === doctorId ? { ...doctor, medicalCenterId: newMedicalCenterId } : doctor
        )
      );
    } catch (err) {
      console.error("Error updating medicalCenterId:", err);
      setError("වෛද්‍යවරයාගේ වෛද්‍ය මධ්‍යස්ථාන ID යාවත්කාලීන කිරීමට අපහසු වුණා.");
    }
  };

  const genAI = new GoogleGenerativeAI("AIzaSyBD_aOnEig3WlB-d6vahalfQPkWEDq0Wgk");
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const generateDoctorLink = (doctor: Doctor) => {
    return `[${doctor.name}](#doctor:${doctor.id})`;
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: chats.length + 1,
      type: "user",
      content: message,
      timestamp: format(new Date(), "hh:mm a"),
    };

    setChats((prev) => [...prev, userMessage]);
    setMessage("");

    try {
      const normalizedMessage = message.trim().toLowerCase();
      const isDoctorRequest = normalizedMessage.includes("doctor") || 
                            normalizedMessage.includes("doctors") || 
                            normalizedMessage.includes("වෛද්‍යවරු") || 
                            normalizedMessage.includes("වෛද්‍යවරයා");
      const isMoreDoctorsRequest = normalizedMessage.includes("තවත් වෛද්‍යවරු") || 
                                  normalizedMessage.includes("අනිත් වෛද්‍යවරු");

      let prompt = "";
      let botResponse = "";
      let matchingDoctors: Doctor[] = [];

      if (isCollectingSymptoms && !isDoctorRequest && !isMoreDoctorsRequest) {
        setSymptoms((prev) => [...prev, normalizedMessage]);
        prompt = `
          Your name is MediLink. You are a friendly health buddy responding in Sinhala. The user reported symptoms: "${[...symptoms, normalizedMessage].join(", ")}".
          Analyze the symptoms to identify the most likely medical condition. If the symptoms are insufficient to determine a condition, ask for more symptoms in Sinhala with a question like "තවත් රෝග ලක්ෂණ තිබෙනවාද? උදාහරණයක් ලෙස: වේදනාවේ තීව්‍රතාව, කාලය, හෝ වෙනත් රෝග ලක්ෂණ ගැන කියන්න." If enough symptoms are provided to identify a condition, respond with "මෙය ඔබේ රෝගය විය හැකියි: [Condition]" and provide brief advice related to the condition. Do not suggest doctors unless explicitly asked.
          Example: If the user says "මට හිසරදයක් තියෙනවා" and then "එය බරපතලයි, දවස පුරාම තියෙනවා," identify "බරපතල හිසරදය" and respond with "මෙය ඔබේ රෝගය විය හැකියි: බරපතල හිසරදය. බරපතල හිසරදයක් තියෙනවා නම්, ඔබට ජලය බොන්න, අඳුරු පරිසරයක විවේක ගන්න, හෝ බෙහෙත් ගන්න උත්සාහ කරන්න. එය දිගටම පවතිනවා නම්, වෛද්‍ය උපදෙස් ලබාගන්න."
        `;
      } else if (!isDoctorRequest && !isMoreDoctorsRequest) {
        setSymptoms((prev) => [...prev, normalizedMessage]);
        prompt = `
          Your name is MediLink. You are a friendly health buddy responding in Sinhala. The user previously reported symptoms: "${symptoms.join(", ")}". Their latest response is: "${normalizedMessage}".
          Analyze all symptoms ("${[...symptoms, normalizedMessage].join(", ")}") to confirm or refine the identified medical condition. Respond with "මෙය ඔබේ රෝගය විය හැකියි: [Condition]" and provide advice related to the condition. If the condition is unclear, state "ඔබේ රෝග තත්ත්වය පැහැදිලි නැත" and ask for more symptoms with "තවත් රෝග ලක්ෂණ තිබෙනවාද? උදාහරණයක් ලෙස: වේදනාවේ තීව්‍රතාව, කාලය, හෝ වෙනත් රෝග ලක්ෂණ ගැන කියන්න." Do not suggest doctors unless explicitly asked.
        `;
      } else {
        setIsCollectingSymptoms(false);
        prompt = `
          Your name is MediLink. You are a friendly health buddy responding in Sinhala. The user reported symptoms: "${symptoms.join(", ")}". Their latest response is: "${normalizedMessage}".
          Doctor data: ${JSON.stringify(doctors)}
          User location: "${location || "unknown"}"
          The user has requested doctors. Analyze the symptoms to identify the most relevant medical condition or specialty. Recommend one doctor whose specialty or conditions match the identified condition and is located in or near the user's location (if provided). If no location is provided or no doctors match, prioritize a relevant specialty. If no specific match, suggest a general practitioner. Provide the doctor's details in the format: "[Doctor Name](#doctor:DoctorID) (විශේෂත්වය: Specialty, ස්ථානය: Location, අධ්‍යාපනය: Education, පළපුරුද්ද: Experience, ජීව දත්ත: Bio)". Respond in Sinhala.
        `;
      }

      const result = await model.generateContent(prompt);
      botResponse = await result.response.text();

      if (isDoctorRequest || isMoreDoctorsRequest) {
        matchingDoctors = doctors
          .filter((doctor) => {
            const matchesSpecialty =
              doctor.specialty.toLowerCase().includes(lastCondition) ||
              doctor.specialty.toLowerCase().includes(normalizedMessage) ||
              doctor.conditions.some(
                (condition) =>
                  symptoms.some((symptom) => symptom.includes(condition.toLowerCase())) ||
                  normalizedMessage.includes(condition.toLowerCase())
              );
            const matchesLocation =
              !location ||
              doctor.location.toLowerCase().includes(location.toLowerCase());
            return matchesSpecialty && matchesLocation;
          })
          .sort((a, b) => b.rating - a.rating);

        if (matchingDoctors.length === 0) {
          matchingDoctors = doctors
            .filter(
              (doctor) =>
                (doctor.specialty.toLowerCase().includes("general practitioner") ||
                  doctor.specialty.toLowerCase().includes("family medicine")) &&
                (!location ||
                  doctor.location.toLowerCase().includes(location.toLowerCase()))
            )
            .sort((a, b) => b.rating - a.rating);
        }

        setSuggestedDoctors(matchingDoctors);

        if (matchingDoctors.length > 0) {
          const doctorIndex = isMoreDoctorsRequest
            ? (currentDoctorIndex + 1) % matchingDoctors.length
            : 0;
          setCurrentDoctorIndex(doctorIndex);
          const doctor = matchingDoctors[doctorIndex];
          botResponse += `\n\nඔබේ රෝග ලක්ෂණ සහ ස්ථානය අනුව, පහත වෛද්‍යවරයා ගැන සලකා බලන්න පුළුවන්:\n[${doctor.name}](#doctor:${doctor.id}) (විශේෂත්වය: ${doctor.specialty}, ස්ථානය: ${doctor.location}, අධ්‍යාපනය: ${doctor.education}, පළපුරුද්ද: ${doctor.experience}, ජීව දත්ත: ${doctor.bio})\n\nවෛද්‍යවරයාගේ නම මත ක්ලික් කරලා ඔවුන්ගේ සම්පූර්ණ විස්තර බලන්න. ඔබේ පහසුව අනුව මෙම වෛද්‍යවරයා තෝරාගන්න. තවත් වෛද්‍යවරුන් ගැන දැනගන්න ඕන නම්, "තවත් වෛද්‍යවරු" කියලා ටයිප් කරන්න.`;
        } else {
          botResponse += `\n\nමම ${location || "ඔබේ ප්‍රදේශයේ"} ඒ සඳහා විශේෂඥ වෛද්‍යවරයෙකු හොයාගන්න බැරි වුණා, නමුත් සාමාන්‍ය වෛද්‍යවරයෙකුට ඔබව පරීක්ෂා කරන්න පුළුවන්. එවැන්නෙකු හොයන්නද?`;
        }
      } else {
        // Check if enough symptoms are collected to make a diagnosis
        const symptomCount = [...symptoms, normalizedMessage].length;
        if (symptomCount >= 2) { // Arbitrary threshold for enough symptoms
          setIsCollectingSymptoms(false);
          setLastCondition([...symptoms, normalizedMessage].join(", "));
        }
      }

      const botMessage: ChatMessage = {
        id: chats.length + 2,
        type: "bot",
        content: botResponse,
        timestamp: format(new Date(), "hh:mm a"),
      };

      setChats((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error with Gemini AI:", error);
      const errorMessage: ChatMessage = {
        id: chats.length + 2,
        type: "bot",
        content: "අප්ස! යමක් වැරදුණා. කරුණාකර ආයෙත් උත්සාහ කරන්න.",
        timestamp: format(new Date(), "hh:mm a"),
      };
      setChats((prev) => [...prev, errorMessage]);
    }
  };

  if (isLoadingDoctors) {
    return (
      <div className="h-[calc(100vh-6rem)] flex items-center justify-center bg-gray-900 text-cyan-50">
        වෛද්‍යවරුන්ගේ තොරතුරු ලබා ගනිමින්...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-6rem)] flex items-center justify-center bg-gray-900 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col lg:flex-row lg:space-x-4">
      <Sidebar
        sessions={mockSessions}
        activeSession={activeSession}
        isSidebarOpen={isSidebarOpen}
        setActiveSession={setActiveSession}
        toggleSidebar={toggleSidebar}
      />

      <div className="flex-1 flex flex-col space-y-4 px-4 lg:px-0">
        <LocationBar location={location} setLocation={setLocation} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 cyber-card p-4 overflow-hidden"
        >
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 pb-4">
              {chats.map((chat, index) => (
                <ChatMessageComponent
                  key={chat.id}
                  chat={chat}
                  index={index}
                  navigate={navigate}
                />
              ))}
            </div>

            <ChatInput
              message={message}
              setMessage={setMessage}
              handleSendMessage={handleSendMessage}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatHistory;