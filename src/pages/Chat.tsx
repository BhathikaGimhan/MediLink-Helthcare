import { motion } from "framer-motion";
import { format } from "date-fns";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc, addDoc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import Sidebar from "../components/chat/Sidebar";
import LocationBar from "../components/chat/LocationBar";
import ChatMessageComponent from "../components/chat/ChatMessageComponent";
import ChatInput from "../components/chat/ChatInput";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/userStore";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import Loader from "../components/Loader";

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
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  type: "bot" | "user";
  content: string;
  timestamp: string;
}

const ChatHistory: React.FC = () => {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState("");
  const [userName, setUserName] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generativeChat, setGenerativeChat] = useState<any>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch and save user details (name, location), create user doc if not exists
useEffect(() => {
  

  if (!user) return;
  const userRef = doc(db, "users", user.id);
  const fetchUserDetails = async () => {
    try {
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData?.location) setLocation(userData.location);
        if (userData?.name) setUserName(userData.name);
      } else {
        
        // If no user document exists, use Google displayName if available
        const googleName = user.name || null;
        setUserName(googleName);
        await setDoc(userRef, { 
          createdAt: new Date().toISOString(),
          name: googleName || "", // Save Google displayName to Firestore
          location: ""
        });
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
      setError("පරිශීලක තොරතුරු ලබා ගැනීමට අපහසු වුණා.");
    }
  };
  fetchUserDetails();

  const saveUserDetails = async () => {
    if (location.trim() || userName) {
      try {
        await setDoc(userRef, { location, name: userName || "" }, { merge: true });
      } catch (err) {
        console.error("Error saving user details:", err);
        setError("පරිශීලක තොරතුරු සුරැකීමට අපහසු වුණා.");
      }
    }
  };
  saveUserDetails();
}, [user, location, userName]);

  // Fetch doctors
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
            medicalCenterId: data. medicalCenterId || "",
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

  // Fetch chat sessions in real-time
  useEffect(() => {
    if (!user) return;
    const sessionsRef = collection(db, `users/${user.id}/chatSessions`);
    const unsubscribe = onSnapshot(sessionsRef, (snapshot) => {
      const sessionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        date: doc.data().date || new Date().toISOString(),
        preview: doc.data().preview || "New Chat",
        messages: Array.isArray(doc.data().messages) ? doc.data().messages : [],
      })) as ChatSession[];
      setChatSessions(sessionsData);
      if (sessionsData.length > 0 && !activeSession) {
        setActiveSession(sessionsData[0].id);
      } else if (sessionsData.length === 0 && !activeSession) {
        startNewChat();
      }
      setIsLoadingSessions(false);
    }, (err) => {
      console.error("Error fetching chat sessions:", err);
      setError("චැට් සැසි ලබා ගැනීමට අපහසු වුණා.");
      setIsLoadingSessions(false);
    });
    return () => unsubscribe();
  }, [user, activeSession]);

  // Load messages and initialize generative chat for active session
  useEffect(() => {
    if (!activeSession || isLoadingDoctors || !doctors.length) return;
    const session = chatSessions.find((s) => s.id === activeSession);
    if (session) {
      setChats(session.messages);

      const shortDoctors = doctors.map(d => ({
        id: d.id,
        name: d.name,
        specialty: d.specialty,
        location: d.location,
        education: d.education,
        experience: d.experience,
        bio: d.bio,
        nextSlot: d.availability.nextSlot,
        procedures: d.procedures.join(', '),
        conditions: d.conditions.join(', '),
        privateClinic: `${d.privateClinic.name} (${d.privateClinic.address})`,
        medicalCenterName: d.medicalCenterName,
      }));

      const history = session.messages
        .filter((msg, idx) => !(idx === 0 && msg.type === "bot"))
        .map(msg => ({
          role: msg.type === "bot" ? "model" : "user",
          parts: [{ text: msg.content }],
        }));

      const systemInstruction = `
        ඔබ MediLink, මිත්‍රශීලී සෞඛ්‍ය මිතුරෙකි. සෑම විටම සිංහලෙන් පිළිතුරු දෙන්න. වෛද්‍යවරයෙකු මෙන් රෝග ලක්ෂණ විශ්ලේෂණය කරන්න, පියවරෙන් පියවරට.
        ඔබේ පිළිතුරු මිනිසෙකු සමඟ කතාබහ කරනවා වගේ ස්වභාවික, සංවාදාත්මක සහ මිත්‍රශීලී විය යුතුයි. පෙර පණිවිඩයන් යොමු කරමින් පිළිතුරු දෙන්න.
        පරිශීලකයාගේ නම දන්නේ නම් එයින් ආමන්ත්‍රණය කරන්න (නම: ${userName || "අදුනා නොගත්"}). නම නොදන්නේ නම්, මුලදී ආචාර කර නම ඉල්ලන්න.
        රෝග ලක්ෂණ එකින් එක එකතු කරන්න, අනුප්‍රශ්න අසමින් වැඩි විස්තර ලබාගන්න (උදා: වේදනාවේ තීව්‍රතාව, කාලය, ස්ථානය).
        ප්‍රමාණවත් ලක්ෂණ (අවම 2-3) ලැබුණු පසු, සම්භාව්‍ය රෝග තත්ත්වය විශ්ලේෂණය කරන්න, කෙටි උපදෙස් දෙන්න. බරපතල නම්, වහාම වෛද්‍ය උපදෙස් ලබාගන්න කියන්න.
        පරිශීලකයා වෛද්‍යවරුන් ඉල්ලුවොත්, රෝගයට ගැලපෙන, ස්ථානයට ආසන්න (පරිශීලක ස්ථානය: ${location || "අදුනා නොගත්"}) 1-2 වෛද්‍යවරුන් යෝජනා කරන්න.
        වෛද්‍ය ආකෘතිය: **[වෛද්‍ය නම](#doctor:ID)** (විශේෂත්වය: Specialty, ස්ථානය: Location, අධ්‍යාපනය: Education, පළපුරුද්ද: Experience, ජීව දත්ත: Bio, ඊළඟ වේලාව: NextSlot, ක්‍රියා පටිපාටි: Procedures, රෝග: Conditions, පුද්ගලික සායනය: PrivateClinic, වෛද්‍ය මධ්‍යස්ථානය: MedicalCenterName).
        පරිශීලකයා විසින් වෛද්‍යවරයෙකු තෝරා ගත් විට, එම වෛද්‍යවරයාගේ සම්පූර්ණ තොරතුරු (ID, නම, විශේෂත්වය, ස්ථානය, අධ්‍යාපනය, පළපුරුද්ද, ජීව දත්ත, ඊළඟ වේලාව, ක්‍රියා පටිපාටි, රෝග, පුද්ගලික සායනය, වෛද්‍ය මධ්‍යස්ථානය) structured format එකකින් ලබා දෙන්න.
        විස්තර ඉල්ලුවොත්, සම්පූර්ණ තොරතුරු දෙන්න. තවත් වෛද්‍යවරු ඉල්ලුවොත්, තවත් යෝජනා කරන්න.
        වෛද්‍ය ලැයිස්තුව: ${JSON.stringify(shortDoctors)}
      `;

      const genAI = new GoogleGenerativeAI("AIzaSyBD_aOnEig3WlB-d6vahalfQPkWEDq0Wgk");
      const genModel = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction,
      });

      const chat = genModel.startChat({
        history: history,
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      setGenerativeChat(chat);
    }
  }, [activeSession, chatSessions, doctors, isLoadingDoctors, userName, location]);

  // Start new chat session
  const startNewChat = async () => {
    if (!user) return;
    try {
      const sessionsRef = collection(db, `users/${user.id}/chatSessions`);
      const initialMessage: ChatMessage = {
        id: uuidv4(),
        type: "bot",
        content: userName
          ? `ආයුබෝවන් ${userName}! මම MediLink AI, ඔබේ හිතවත් සෞඛ්‍ය උපදේශකයා. අද ඔබට තියෙන රෝග ලක්ෂණ මොනවාද?`
          : "ආයුබෝවන්! මම MediLink AI, ඔබේ හිතවත් සෞඛ්‍ය උපදේශකයා. ඔබේ නම මට කියන්න පුළුවන්ද? එහෙම නැත්නම්, අද ඔබට තියෙන රෝග ලක්ෂණ මොනවාද?",
        timestamp: format(new Date(), "hh:mm a"),
      };
      const newSession = {
        date: new Date().toISOString(),
        preview: "New Chat",
        messages: [initialMessage],
      };
      const docRef = await addDoc(sessionsRef, newSession);
      setActiveSession(docRef.id);
      setChats([]);
    } catch (err) {
      console.error("Error creating new chat session:", err);
      setError("නව චැට් සැසියක් ආරම්භ කිරීමට අපහසු වුණා.");
    }
  };

  // Handle doctor selection from LocationBar
  const handleDoctorSelect = async (doctor: Doctor) => {
    if (!user || !activeSession || !generativeChat) return;

    const sessionRef = doc(db, `users/${user.id}/chatSessions/${activeSession}`);
    const doctorMessage: ChatMessage = {
      id: uuidv4(),
      type: "bot",
      content: `ඔබ තෝරාගත් වෛද්‍යවරයා: **${doctor.name}** (විශේෂත්වය: ${doctor.specialty}, ස්ථානය: ${doctor.location}, අධ්‍යාපනය: ${doctor.education}, පළපුරුද්ද: ${doctor.experience}, ජීව දත්ත: ${doctor.bio}, ඊළඟ වේලාව: ${doctor.availability.nextSlot}, ක්‍රියා පටිපාටි: ${doctor.procedures.join(', ')}, රෝග: ${doctor.conditions.join(', ')}, පුද්ගලික සායනය: ${doctor.privateClinic.name} (${doctor.privateClinic.address}), වෛද්‍ය මධ්‍යස්ථානය: ${doctor.medicalCenterName})`,
      timestamp: format(new Date(), "hh:mm a"),
    };

    const updatedChats = [...chats, doctorMessage];
    setChats(updatedChats);

    try {
      await updateDoc(sessionRef, {
        messages: updatedChats,
        preview: `Doctor: ${doctor.name}`,
        date: new Date().toISOString(),
      });

      navigate(`/doctors/details/${doctor.id}`);
    } catch (err) {
      console.error("Error saving doctor message:", err);
      setError("වෛද්‍ය තොරතුරු සුරැකීමට අපහසු වුණා.");
    }
  };

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

  const handleSendMessage = async () => {
    if (!message.trim() || !user || !activeSession || !generativeChat) return;

    const sessionRef = doc(db, `users/${user.id}/chatSessions/${activeSession}`);

    const userMessage: ChatMessage = {
      id: uuidv4(),
      type: "user",
      content: message,
      timestamp: format(new Date(), "hh:mm a"),
    };

    let updatedChats = [...chats, userMessage];
    setChats(updatedChats);

    try {
      await updateDoc(sessionRef, {
        messages: updatedChats,
        preview: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
        date: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error saving user message:", err);
      setError("පණිවිඩය සුරැකීමට අපහසු වුණා.");
      return;
    }

    setMessage("");

    const normalizedMessage = message.trim().toLowerCase();
    if ((normalizedMessage.includes("මගේ නම") || normalizedMessage.includes("my name is")) && !userName) {
      const nameMatch = message.match(/(?:මගේ නම|my name is)\s*([\w\s]+)/i);
      if (nameMatch && nameMatch[1]) {
        const extractedName = nameMatch[1].trim();
        setUserName(extractedName);
        const userRef = doc(db, "users", user.id);
        await setDoc(userRef, { name: extractedName }, { merge: true });
      }
    }

    try {
      const result = await generativeChat.sendMessage(message);
      const botResponse = await result.response.text();

      const botMessage: ChatMessage = {
        id: uuidv4(),
        type: "bot",
        content: botResponse,
        timestamp: format(new Date(), "hh:mm a"),
      };

      updatedChats = [...updatedChats, botMessage];
      setChats(updatedChats);

      await updateDoc(sessionRef, {
        messages: updatedChats,
        preview: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
        date: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error with Gemini AI or Firestore:", error);

      const errorMessage: ChatMessage = {
        id: uuidv4(),
        type: "bot",
        content: `${userName || "ඔබ"}ට, අප්ස! යමක් වැරදුණා. කරුණාකර ආයෙත් උත්සාහ කරන්න.`,
        timestamp: format(new Date(), "hh:mm a"),
      };

      updatedChats = [...updatedChats, errorMessage];
      setChats(updatedChats);
      try {
        await updateDoc(sessionRef, {
          messages: updatedChats,
          preview: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
          date: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Error saving error message:", err);
        setError("පණිවිඩය සුරැකීමට අපහසු වුණා.");
      }
    }
  };

  if (isLoadingDoctors || isLoadingSessions) {
    return (
      <Loader/>
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
        sessions={chatSessions}
        activeSession={activeSession || ""}
        isSidebarOpen={isSidebarOpen}
        setActiveSession={setActiveSession}
        toggleSidebar={toggleSidebar}
        startNewChat={startNewChat}
      />

      <div className="flex-1 flex flex-col space-y-4 px-4 lg:px-0">
        <LocationBar
          location={location}
          setLocation={setLocation}
          onDoctorSelect={handleDoctorSelect} // Pass handler to LocationBar
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 cyber-card p-4 overflow-hidden"
        >
          <div className="h-full flex flex-col">
            <div className="為flex-1 overflow-y-auto space-y-4 pb-4">
              {chats.map((chat, index) => (
                <ChatMessageComponent
                  key={chat.id}
                  chat={chat}
                  index={index}
                  navigate={navigate}
                />
              ))}
            </div>
<div className="absolute bottom-3 w-[98%]">
            <ChatInput
              message={message}
              setMessage={setMessage}
              handleSendMessage={handleSendMessage}
            />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatHistory;