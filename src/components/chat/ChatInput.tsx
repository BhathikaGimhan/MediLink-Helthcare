import { Send } from "lucide-react";

interface ChatInputProps {
  message: string;
  setMessage: (value: string) => void;
  handleSendMessage: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  message,
  setMessage,
  handleSendMessage,
}) => (
  <div className="mt-4 flex space-x-4">
    <input
      type="text"
      placeholder="Tell me about your symptoms..."
      className="flex-1 px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400"
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
    />
    <button className="cyber-button" onClick={handleSendMessage}>
      <Send className="w-5 h-5" />
    </button>
  </div>
);

export default ChatInput;