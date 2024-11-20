import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useNotificationStore } from "../stores/notificationStore";
import { Bell, Bot, Home, MessageCircle, Star, Users } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const links = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/doctors", icon: Star, label: "Doctors" },
    { to: "/community", icon: Users, label: "Community" },
    { to: "/chat-history", icon: Bot, label: "AI Chat" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-900/90 backdrop-blur-sm border-b border-cyan-500/30 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <MessageCircle className="w-8 h-8 text-cyan-400" />
            <span className="text-xl font-bold neon-text">MediLink</span>
          </Link>

          <div className="flex items-center space-x-8">
            {links.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to} className="relative group">
                <div className="flex items-center space-x-2 text-gray-300 hover:text-cyan-400 transition-colors">
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </div>
                {location.pathname === to && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}
            <Link to="/notifications" className="relative">
              <Bell className="w-5 h-5 text-gray-300 hover:text-cyan-400 transition-colors" />
              {unreadCount > -1 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
