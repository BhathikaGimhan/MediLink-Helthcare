import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useNotificationStore } from "../stores/notificationStore";
import {
  Bell,
  Bot,
  Home,
  MessageCircle,
  Star,
  Users,
  Menu,
  X,
  LogIn,
} from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const location = useLocation();
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const links = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/doctors", icon: Star, label: "Doctors" },
    { to: "/community", icon: Users, label: "Community" },
    { to: "/chat-history", icon: Bot, label: "AI Chat" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-900 border-b border-cyan-500/30 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <MessageCircle className="w-8 h-8 text-cyan-400" />
            <span className="text-xl font-bold neon-text">MediLink</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            {links.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to} className="relative group">
                <div
                  className={`flex items-center ${
                    location.pathname === to ? "text-cyan-400" : "text-gray-300"
                  } space-x-2  hover:text-cyan-400 transition-colors`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </div>
                {location.pathname === to && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-10 left-0 right-0 h-0.5 bg-cyan-400"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                )}
              </Link>
            ))}

            {/* Notifications Icon */}
            <Link to="/notifications" className="relative">
              <div className="relative group">
                <Bell
                  className={`w-6 h-6  hover:text-cyan-400 group transition-colors ${
                    location.pathname === "/notifications"
                      ? "text-cyan-400"
                      : "text-gray-300"
                  }`}
                />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500/50 animate-pulse group-hover:animate-none backdrop-blur-sm text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
            </Link>

            {/* Login Link */}
            <Link
              to="/login"
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
            >
              <LogIn className="w-5 h-5 inline-block mr-2" />
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-gray-300 z-50 hover:text-cyan-400"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 z-50" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isMenuOpen ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 right-0 bottom-0 w-3/4 bg-gray-900 p-6 lg:hidden"
      >
        <div className="flex flex-col space-y-6">
          {links.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setIsMenuOpen(false)}
              className={`flex ${
                location.pathname === to ? "text-cyan-400" : "text-gray-300"
              } items-center space-x-2  hover:text-cyan-400 transition-colors`}
            >
              <Icon className="w-6 h-6" />
              <span>{label}</span>
            </Link>
          ))}
          <Link
            to="/notifications"
            onClick={() => setIsMenuOpen(false)}
            className={`relative flex items-center space-x-2 ${
              location.pathname === "/notifications"
                ? "text-cyan-400"
                : "text-gray-300"
            } hover:text-cyan-400 transition-colors`}
          >
            <Bell className="w-6 h-6" />
            <span>Notification</span>
            {unreadCount > 0 && (
              <span
                className={`absolute top-1 right-9 text-gray-300 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center`}
              >
                {unreadCount}
              </span>
            )}
          </Link>

          {/* Login Link in Mobile */}
          <Link
            to="/login"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center space-x-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            <LogIn className="w-6 h-6 inline-block mr-2" />
            <span>Login</span>
          </Link>
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;
