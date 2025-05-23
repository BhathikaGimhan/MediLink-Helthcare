
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Sidebar from "../components/chat/Sidebar";
import LocationBar from "../components/chat/LocationBar";
import ChatMessageComponent from "../components/chat/ChatMessageComponent";
import ChatInput from "../components/chat/ChatInput";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/userStore";
// Hardcoded doctor data
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  conditions: string[];
}

const doctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. John Smith",
    specialty: "Neurology",
    location: "Downtown",
    conditions: ["headache", "migraine", "neuralgia"],
  },
  {
    id: "2",
    name: "Dr. Emily Johnson",
    specialty: "Cardiology",
    location: "Midtown",
    conditions: ["chest pain", "heart palpitations"],
  },
  {
    id: "3",
    name: "Dr. Michael Lee",
    specialty: "Orthopedics",
    location: "Downtown",
    conditions: ["back pain", "joint pain"],
  },
  {
    id: "4",
    name: "Dr. Sarah Perera",
    specialty: "Gastroenterology",
    location: "Downtown",
    conditions: ["stomach pain", "abdominal discomfort", "indigestion"],
  },
];

// Chat session interface
export interface ChatSession {
  id: string;
  date: string;
  preview: string;
}

// Chat message interface
export interface ChatMessage {
  id: number;
  type: "bot" | "user";
  content: string;
  timestamp: string;
}

// Mock chat sessions
const mockSessions: ChatSession[] = [
  {
    id: "1",
    date: "2024-03-10",
    preview: "Consultation about neural enhancement...",
  },
  {
    id: "2",
    date: "2024-03-08",
    preview: "Questions about cognitive therapy...",
  },
];


// Main ChatHistory component
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
      content:
        "Hey there! I'm MediLink AI, your friendly health buddy. What's going on with you today?",
      timestamp: format(new Date(), "hh:mm a"),
    },
  ]);
  const [lastCondition, setLastCondition] = useState<string>("");
  const [isWaitingForDetails, setIsWaitingForDetails] = useState<boolean>(false);

  useEffect(() => {
    if (!user) {
      navigate("/login"); // Redirect to login if not authenticated
    }
  }, [user, navigate]);

  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(
    "AIzaSyArwTwGGW5Xp-9i3TXWB2rthlboEefVV3U"
  ); // Replace with your API key
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Handle sidebar resize
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

  // Toggle sidebar
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Handle message submission
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
      const normalizedMessage = message.trim(); // <-- NO TRANSLATION
  
      const isNewCondition = !lastCondition || chats.length <= 2;
  
      let prompt = "";
      let botResponse = "";
      let matchingDoctors: Doctor[] = [];
  
      if (isNewCondition) {
        prompt = `
          Your name is MediLink. yor are friendly health buddy.. The user reported: "${normalizedMessage}".
        `;
        setLastCondition(normalizedMessage);
        setIsWaitingForDetails(true);
      } else if (isWaitingForDetails) {
        prompt = `
          Your name is MediLink. yor are friendly health buddy.. The user previously reported: "${lastCondition}". Their latest response is: "${normalizedMessage}".
          Doctor data: ${JSON.stringify(doctors)}
        `;
        setIsWaitingForDetails(false);
      } else {
        prompt = `
          Your name is MediLink. yor are friendly health buddy.. The user previously reported: "${lastCondition}". Their latest response is: "${normalizedMessage}".
          Doctor data: ${JSON.stringify(doctors)}
        `;
      }
  
      const result = await model.generateContent(prompt);
      botResponse = await result.response.text();
  
      if (!isWaitingForDetails) {
        matchingDoctors = doctors.filter(
          (doctor) =>
            lastCondition.includes(doctor.specialty.toLowerCase()) ||
            doctor.conditions.some((condition) =>
              lastCondition.includes(condition.toLowerCase())
            )
        );
  
        if (matchingDoctors.length > 0 && !botResponse.includes("could help")) {
          botResponse += ` Oh, and I know a few doctors who could help with this. Like, there’s ${matchingDoctors
            .map((doc) => `${doc.name}, a ${doc.specialty.toLowerCase()} in ${doc.location}`)
            .join(" or ")}. Want more info on them?`;
        } else if (!botResponse.includes("could help")) {
          botResponse += ` I don’t have a specialist for that right now, but a general doctor could check you out. Want me to look for one?`;
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
                <ChatMessageComponent key={chat.id} chat={chat} index={index} />
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