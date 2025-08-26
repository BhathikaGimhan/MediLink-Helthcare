// src/components/Navbar.tsx
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useNotificationStore } from "../stores/notificationStore";
import { useUserStore } from "../stores/userStore";
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
  User,
  LogOut,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const { user, setUser } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsMenuOpen(false);
      setIsTooltipOpen(false);
      navigate("/login");
    } catch (err: any) {
      console.error("Logout Error:", err);
    }
  };

  const toggleTooltip = () => {
    setIsTooltipOpen(!isTooltipOpen);
  };

  const links = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/doctors", icon: Star, label: "Doctors" },
    { to: "/community", icon: Users, label: "Community" },
    { to: "/chat-history", icon: Bot, label: "AI Chat" },
    ...(user && user.role === "admin-1"
      ? [{ to: "/admin", icon: Shield, label: "Admin Dashboard" }]
      : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-900/90 border-b border-cyan-500/30 z-50 backdrop-blur-md shadow-[0_0_10px_rgba(34,211,238,0.3)]">
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
                    location.pathname === to ? "text-cyan-400 neon-text" : "text-gray-300"
                  } space-x-2 hover:text-cyan-400 transition-colors`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </div>
                {location.pathname === to && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.5)]"
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
                  className={`w-6 h-6 hover:text-cyan-400 transition-colors ${
                    location.pathname === "/notifications"
                      ? "text-cyan-400 neon-text"
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

            {/* User or Login */}
            {user ? (
              <div className="relative flex items-center space-x-4">
                <button
                  onClick={toggleTooltip}
                  className="text-cyan-400 hover:text-cyan-200 transition-colors"
                  aria-label="User profile"
                >
                  <User className="w-6 h-6" />
                </button>
                {isTooltipOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-12 right-0 bg-gray-800/90 border border-cyan-500/50 rounded-lg p-4 w-64 backdrop-blur-md shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                  >
                    <p className="text-cyan-400 neon-text font-bold">{user.name}</p>
                    <p className="text-gray-400 text-sm">{user.email || "No email available"}</p>
                    <p className="text-gray-400 text-sm">Role: {user.role}</p>
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={handleLogout}
                        className="cyber-button flex-1 flex items-center justify-center space-x-2 text-gray-900"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                      <button
                        onClick={toggleTooltip}
                        className="flex-1 text-gray-400 hover:text-cyan-400 text-sm underline"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="cyber-button py-2 px-4 text-gray-900 hover:bg-cyan-400 transition-colors"
              >
                <LogIn className="w-5 h-5 inline-block mr-2" />
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-gray-300 z-50 hover:text-cyan-400 transition-colors"
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
        className="fixed top-0 right-0 bottom-0 w-3/4  bg-gray-900/95 p-6 lg:hidden border-l border-cyan-500/30"
      >
        <div className="flex flex-col space-y-6">
          {links.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setIsMenuOpen(false)}
              className={`flex ${
                location.pathname === to ? "text-cyan-400 neon-text" : "text-gray-300"
              } items-center space-x-2 hover:text-cyan-400 transition-colors`}
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
                ? "text-cyan-400 neon-text"
                : "text-gray-300"
            } hover:text-cyan-400 transition-colors`}
          >
            <Bell className="w-6 h-6" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span
                className={`absolute top-1 left-24 text-gray-300 bg-red-500/50 text-xs rounded-full w-5 h-5 flex items-center justify-center`}
              >
                {unreadCount}
              </span>
            )}
          </Link>

          {/* User or Login in Mobile */}
          {user ? (
            <>
              <div className="relative flex items-center space-x-2">
                <button
                  onClick={toggleTooltip}
                  className="text-cyan-400 hover:text-cyan-200 transition-colors"
                  aria-label="User profile"
                >
                  <User className="w-6 h-6" />
                  <span className="text-gray-300 hover:text-cyan-400">Profile</span>
                </button>
                {isTooltipOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-10 left-0 bg-gray-800/90 border border-cyan-500/50 rounded-lg p-4 w-64 backdrop-blur-md shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                  >
                    <p className="text-cyan-400 neon-text font-bold">{user.name}</p>
                    <p className="text-gray-400 text-sm">{user.email || "No email available"}</p>
                    <p className="text-gray-400 text-sm">Role: {user.role}</p>
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={handleLogout}
                        className="cyber-button flex-1 flex items-center justify-center space-x-2 text-gray-900"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                      <button
                        onClick={toggleTooltip}
                        className="flex-1 text-gray-400 hover:text-cyan-400 text-sm underline"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-300 hover:text-cyan-400 transition-colors"
              >
                <LogOut className="w-6 h-6" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center space-x-2 cyber-button py-2 px-4 text-gray-900 hover:bg-cyan-400 transition-colors"
            >
              <LogIn className="w-6 h-6 inline-block mr-2" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;