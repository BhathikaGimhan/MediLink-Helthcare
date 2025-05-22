
import { motion } from "framer-motion";
import { Plus, ChevronRight, ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { ChatSession } from "../../pages/Chat";

interface SidebarProps {
  sessions: ChatSession[];
  activeSession: string;
  isSidebarOpen: boolean;
  setActiveSession: (id: string) => void;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSession,
  isSidebarOpen,
  setActiveSession,
  toggleSidebar,
}) => (
  <motion.div
    initial={{ x: isSidebarOpen ? 0 : -300 }}
    animate={{ x: isSidebarOpen ? 0 : -260 }}
    transition={{ duration: 0.3 }}
    className={`fixed lg:relative z-40 top-0 left-0 h-full w-64 cyber-card p-4 flex flex-col lg:block ${
      isSidebarOpen ? "z-50" : "lg:flex"
    }`}
  >
    <button
      onClick={() => console.log("Start new chat")}
      className="cyber-button w-full mb-4 flex items-center justify-center space-x-2"
    >
      <Plus className="w-4 h-4" />
      <span>New Chat</span>
    </button>

    <div className="flex-1 overflow-y-auto space-y-2">
      {sessions.map((session) => (
        <div
          key={session.id}
          onClick={() => setActiveSession(session.id)}
          className={`p-3 rounded-lg cursor-pointer transition-colors ${
            activeSession === session.id
              ? "bg-cyan-900/30 border border-cyan-500/30"
              : "hover:bg-gray-800"
          }`}
        >
          <div className="text-sm font-semibold mb-1">
            {format(new Date(session.date), "MMM d, yyyy")}
          </div>
          <p className="text-xs text-gray-400 truncate">{session.preview}</p>
        </div>
      ))}
    </div>
    <button
      onClick={toggleSidebar}
      className="absolute h-20 lg:hidden top-1/2 bottom-1/2 -right-9 z-50 p-2 rounded-full bg-gray-800 border border-cyan-500 text-cyan-400 shadow-lg"
    >
      {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
    </button>
  </motion.div>
);

export default Sidebar;