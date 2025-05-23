// src/pages/Login.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock } from "lucide-react";
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, setPersistence, browserSessionPersistence } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/userStore";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, setUser, isLoading: authLoading } = useUserStore();

  useEffect(() => {
    // Set session persistence to ensure auth state persists across page reloads
    setPersistence(auth, browserSessionPersistence).catch((err) => {
      console.error("Error setting persistence:", err);
    });

    // Redirect only if user is authenticated and auth loading is complete
    if (!authLoading && user) {
      navigate(user.role === "admin-1" ? "/admin" : "/");
    }
  }, [user, authLoading, navigate]);

  const fetchUserRole = async (uid: string, displayName: string | null, email: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          id: uid,
          name: displayName || userData.name || email,
          email: userData.email || email,
          role: userData.role || "patient",
        };
      } else {
        // Create a user document if it doesn't exist
        const newUser = {
          id: uid,
          name: displayName || email,
          email,
          role: "patient",
        };
        await setDoc(doc(db, "users", uid), newUser);
        return newUser;
      }
    } catch (err: any) {
      console.error("Error fetching/creating user role:", err);
      return {
        id: uid,
        name: displayName || email,
        email,
        role: "patient",
      };
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userData = await fetchUserRole(result.user.uid, result.user.displayName, result.user.email || "");
      setUser(userData);
      navigate(userData.role === "admin-1" ? "/admin" : "/");
    } catch (err: any) {
      console.error("Google Sign-In Error:", { code: err.code, message: err.message, details: err });
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userData = await fetchUserRole(result.user.uid, result.user.displayName, email);
      setUser(userData);
      navigate(userData.role === "admin-1" ? "/admin" : "/");
    } catch (err: any) {
      console.error("Email/Password Sign-In Error:", { code: err.code, message: err.message, details: err });
      setError(err.message || "Failed to sign in with email/password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center bg-gray-900 text-cyan-50"
    >
      <div className="cyber-card p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold neon-text mb-6 text-center">MediLink Login</h2>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 bg-red-900/20 border border-red-500/30 p-3 rounded-lg text-center mb-4"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-cyan-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-cyan-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || authLoading}
            className="cyber-button w-full flex items-center justify-center space-x-2"
          >
            <LogIn className="w-5 h-5" />
            <span>{isLoading || authLoading ? "Logging in..." : "Sign In"}</span>
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 h-px bg-cyan-500/30"></div>
          <span className="mx-4 text-gray-400">or</span>
          <div className="flex-1 h-px bg-cyan-500/30"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading || authLoading}
          className="cyber-button w-full flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12.24 10.493v2.808h4.633c-.186 1.24-.76 2.28-1.704 2.976l2.784 2.136c1.704-1.584 2.688-3.84 2.688-6.312 0-.672-.072-1.32-.192-1.944h-8.209zm-1.128-2.808v2.808h-4.632c.192 1.248.768 2.28 1.704 2.976l-2.784 2.136c-1.704-1.584-2.688-3.84-2.688-6.312 0-.672.072-1.32.192-1.944h8.208zm1.128-2.808c-3.84 0-7.104 2.496-8.304 6h16.608c-1.2-3.504-4.464-6-8.304-6zm0-2.4c5.328 0 9.672 4.344 9.672 9.672s-4.344 9.672-9.672 9.672-9.672-4.344-9.672-9.672 4.344-9.672 9.672-9.672z"
            />
          </svg>
          <span>{isLoading || authLoading ? "Processing..." : "Sign in with Google"}</span>
        </button>

        <p className="mt-4 text-center text-gray-400">
          Don't have an account?{" "}
          <a href="/reg" className="text-cyan-400 hover:underline">
            Register
          </a>
        </p>
      </div>
    </motion.div>
  );
};

export default Login;