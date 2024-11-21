// Patients.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Heart,
  Share2,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const patientPosts = [
  {
    id: 1,
    author: "Patient_123",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100",
    content:
      "I’ve been dealing with persistent headaches lately. Looking for advice or recommendations for good neurologists.",
    likes: 15,
    comments: 5,
    timeAgo: "3 hours ago",
  },
];

const Patients = () => {
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState(patientPosts);
  const [expandedPost, setExpandedPost] = useState<number | null>(null);

  const handlePostSubmit = () => {
    if (newPost.trim()) {
      const newPostObj = {
        id: posts.length + 1,
        author: "Anonymous Patient",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100",
        content: newPost,
        likes: 0,
        comments: 0,
        timeAgo: "Just now",
      };

      setPosts([newPostObj, ...posts]);
      setNewPost("");
    }
  };

  const toggleExpanded = (postId: number) => {
    setExpandedPost(expandedPost === postId ? null : postId);
  };

  return (
    <div className="space-y-8">
      {/* Post Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card p-6"
      >
        <div className="flex space-x-4">
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100"
            alt="Your avatar"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your health concerns..."
              className="w-full px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400 resize-none"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handlePostSubmit}
                className="cyber-button flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Post</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Posts */}
      <div className="space-y-6">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="cyber-card p-6"
          >
            <div className="flex space-x-4">
              <img
                src={post.avatar}
                alt={post.author}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-cyan-400">{post.author}</h3>
                  <span className="text-sm text-gray-400">{post.timeAgo}</span>
                </div>
                <p className="text-gray-300 mb-4">
                  {expandedPost === post.id
                    ? post.content
                    : `${post.content.slice(0, 100)}...`}
                </p>
                <button
                  className="text-cyan-400 flex items-center"
                  onClick={() => toggleExpanded(post.id)}
                >
                  {expandedPost === post.id ? (
                    <>
                      <ChevronUp className="w-4 h-4" /> Collapse
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" /> Read More
                    </>
                  )}
                </button>
                <div className="flex items-center space-x-6 mt-4">
                  <button className="flex items-center space-x-2 text-gray-400 hover:text-cyan-400 transition-colors">
                    <Heart className="w-4 h-4" />
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-400 hover:text-cyan-400 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-400 hover:text-cyan-400 transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Patients;
