import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MapPin, Bot, User, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface ChatSession {
  id: string;
  date: string;
  preview: string;
}

const mockSessions: ChatSession[] = [
  {
    id: '1',
    date: '2024-03-10',
    preview: 'Consultation about neural enhancement...'
  },
  {
    id: '2',
    date: '2024-03-08',
    preview: 'Questions about cognitive therapy...'
  }
];

const mockChats = [
  {
    id: 1,
    type: 'bot',
    content: "Hello! I'm your MediLink AI assistant. How can I help you today?",
    timestamp: "10:30 AM"
  },
  {
    id: 2,
    type: 'user',
    content: "I need to find a neural specialist near downtown.",
    timestamp: "10:31 AM"
  },
  {
    id: 3,
    type: 'bot',
    content: "I'll help you find a specialist. First, could you confirm your location?",
    timestamp: "10:31 AM"
  }
];

const ChatHistory = () => {
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState('');
  const [activeSession, setActiveSession] = useState<string>('1');

  const startNewChat = () => {
    // Implementation for starting a new chat session
    console.log('Starting new chat session');
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex space-x-4">
      {/* Chat Sessions Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-64 cyber-card p-4 overflow-hidden flex flex-col"
      >
        <button
          onClick={startNewChat}
          className="cyber-button w-full mb-4 flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
        
        <div className="flex-1 overflow-y-auto space-y-2">
          {mockSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => setActiveSession(session.id)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                activeSession === session.id
                  ? 'bg-cyan-900/30 border border-cyan-500/30'
                  : 'hover:bg-gray-800'
              }`}
            >
              <div className="text-sm font-semibold mb-1">
                {format(new Date(session.date), 'MMM d, yyyy')}
              </div>
              <p className="text-xs text-gray-400 truncate">{session.preview}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="cyber-card p-4"
        >
          <div className="flex items-center space-x-4">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <input
              type="text"
              placeholder="Enter your location..."
              className="flex-1 px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 cyber-card p-4 overflow-hidden"
        >
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 pb-4">
              {mockChats.map((chat, index) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${chat.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-gray-800 border border-cyan-500/30 flex items-center justify-center">
                      {chat.type === 'bot' ? (
                        <Bot className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <User className="w-4 h-4 text-cyan-400" />
                      )}
                    </div>
                    <div className={`rounded-lg p-3 ${
                      chat.type === 'user' 
                        ? 'bg-cyan-900/30 border border-cyan-500/30' 
                        : 'bg-gray-800 border border-gray-700'
                    }`}>
                      <p className="text-sm">{chat.content}</p>
                      <span className="text-xs text-gray-400 mt-1 block">
                        {chat.timestamp}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-4 flex space-x-4">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button className="cyber-button">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatHistory;