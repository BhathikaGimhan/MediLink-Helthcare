import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import { ChatMessage } from "../../pages/Chat";

interface ChatMessageProps {
  chat: ChatMessage;
  index: number;
}

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ chat, index }) => (
  <motion.div
    key={chat.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className={`flex ${chat.type === "user" ? "justify-end" : "justify-start"}`}
  >
    <div
      className={`flex items-start space-x-2 max-w-[80%] ${
        chat.type === "user" ? "flex-row-reverse space-x-reverse" : ""
      }`}
    >
      <div className="w-8 h-8 rounded-full bg-gray-800 border border-cyan-500/30 flex items-center justify-center">
        {chat.type === "bot" ? (
          <Bot className="w-4 h-4 text-cyan-400" />
        ) : (
          <User className="w-4 h-4 text-cyan-400" />
        )}
      </div>
      <div
        className={`rounded-lg p-3 ${
          chat.type === "user"
            ? "bg-cyan-900/30 border border-cyan-500/30"
            : "bg-gray-800 border border-gray-700"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{chat.content}</p>
        <span className="text-xs text-gray-400 mt-1 block">
          {chat.timestamp}
        </span>
      </div>
    </div>
  </motion.div>
);

export default ChatMessageComponent;