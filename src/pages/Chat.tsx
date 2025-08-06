import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import Sidebar from "../components/chat/Sidebar";
import LocationBar from "../components/chat/LocationBar";
import ChatMessageComponent from "../components/chat/ChatMessageComponent";
import ChatInput from "../components/chat/ChatInput";
import DoctorSuggestionModal from "../components/chat/DoctorSuggestionModal";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/userStore";

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
      content: "Hey there! I'm MediLink AI, your friendly health buddy. What's going on with you today?",
      timestamp: format(new Date(), "hh:mm a"),
    },
  ]);
  const [lastCondition, setLastCondition] = useState<string>("");
  const [isWaitingForDetails, setIsWaitingForDetails] = useState<boolean>(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestedDoctors, setSuggestedDoctors] = useState<Doctor[]>([]);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);

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
        console.log("Fetched doctors:", doctorsList);
        setDoctors(doctorsList);
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError("Failed to fetch doctors. Please try again later.");
      } finally {
        setIsLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);
  console.log("Doctors state:", doctors);

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
      console.log(`Updated medicalCenterId for doctor ${doctorId} to ${newMedicalCenterId}`);
    } catch (err) {
      console.error("Error updating medicalCenterId:", err);
      setError("Failed to update doctor's medical center ID.");
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
      const normalizedMessage = message.trim();
      const isNewCondition = !lastCondition || chats.length <= 2;
  
      let prompt = "";
      let botResponse = "";
      let matchingDoctors: Doctor[] = [];
  
      if (isNewCondition) {
        prompt = `
          Your name is MediLink. You are a friendly health buddy. The user reported: "${normalizedMessage}".
          Respond with a friendly message asking for more details about their symptoms to better understand their condition.
        `;
        setLastCondition(normalizedMessage);
        setIsWaitingForDetails(true);
      } else if (isWaitingForDetails) {
        prompt = `
          Your name is MediLink. You are a friendly health buddy. The user previously reported: "${lastCondition}". Their latest response with more details is: "${normalizedMessage}".
          Doctor data: ${JSON.stringify(doctors)}
          Analyze the symptoms described in "${lastCondition}" and "${normalizedMessage}" to identify the most relevant medical specialty or condition. Based on this analysis, recommend up to three doctors from the provided data whose specialties or conditions match the symptoms. If no specific match, suggest a general practitioner. For each recommended doctor, provide their name and specialty in the format: "[Doctor Name](#doctor:DoctorID) (Specialty: Specialty)".
        `;
        setIsWaitingForDetails(false);
      } else {
        prompt = `
          Your name is MediLink. You are a friendly health buddy. The user previously reported: "${lastCondition}". Their latest response is: "${normalizedMessage}".
          Doctor data: ${JSON.stringify(doctors)}
          Continue the conversation, providing advice or asking clarifying questions based on the symptoms. Analyze the symptoms to identify the most relevant medical specialty or condition. Recommend up to three doctors from the provided data whose specialties or conditions match the symptoms. If no specific match, suggest a general practitioner. For each recommended doctor, provide their name and specialty in the format: "[Doctor Name](#doctor:DoctorID) (Specialty: Specialty)".
        `;
      }
  
      const result = await model.generateContent(prompt);
      botResponse = await result.response.text();
  
      if (!isWaitingForDetails) {
        matchingDoctors = doctors.filter(
          (doctor) =>
            lastCondition.toLowerCase().includes(doctor.specialty.toLowerCase()) ||
            normalizedMessage.toLowerCase().includes(doctor.specialty.toLowerCase()) ||
            doctor.conditions.some(
              (condition) =>
                lastCondition.toLowerCase().includes(condition.toLowerCase()) ||
                normalizedMessage.toLowerCase().includes(condition.toLowerCase())
            )
        ).slice(0, 3); // Limit to 3 doctors
  
        if (matchingDoctors.length === 0) {
          matchingDoctors = doctors.filter(
            (doctor) =>
              doctor.specialty.toLowerCase().includes("general practitioner") ||
              doctor.specialty.toLowerCase().includes("family medicine")
          ).slice(0, 3);
        }
  
        setSuggestedDoctors(matchingDoctors);
  
        if (matchingDoctors.length > 0) {
          const doctorLinks = matchingDoctors
            .map((doctor) => generateDoctorLink(doctor) + ` (Specialty: ${doctor.specialty})`)
            .join("\n");
  
          botResponse += `\n\nBased on your symptoms, I recommend the following doctor${matchingDoctors.length > 1 ? "s" : ""}:\n${doctorLinks}\n\nClick on a doctor's name to view their details.`;
        } else {
          botResponse += `\n\nI don’t have a specialist for that right now, but a general practitioner could check you out. Want me to look for one?`;
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
        content: "Oops, something went wrong! Can you try again?",
        timestamp: format(new Date(), "hh:mm a"),
      };
      setChats((prev) => [...prev, errorMessage]);
    }
  };

  if (isLoadingDoctors) {
    return (
      <div className="h-[calc(100vh-6rem)] flex items-center justify-center bg-gray-900 text-cyan-50">
        Loading doctors...
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
                <div key={chat.id}>
                  <ChatMessageComponent
                    chat={chat}
                    index={index}
                    navigate={navigate}
                  />
                  {chat.type === "bot" &&
                    chat.content.includes("View Suggested Doctors") && (
                      <div className="flex mt-2">
                        <button
                          className="cyber-button"
                          onClick={() => setIsDoctorModalOpen(true)}
                        >
                          View Suggested Doctors
                        </button>
                      </div>
                    )}
                </div>
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

      <DoctorSuggestionModal
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
        doctors={suggestedDoctors}
        navigate={navigate}
      />
    </div>
  );
};

export default ChatHistory;