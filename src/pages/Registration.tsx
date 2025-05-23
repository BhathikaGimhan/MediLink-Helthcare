// src/pages/Registration.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Building } from "lucide-react";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import { useUserStore } from "../stores/userStore";

const Registration = () => {
  const { user, setUser } = useUserStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [medicalCenterName, setMedicalCenterName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Auto-fill name and email for Google-authenticated users
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userData = {
        id: result.user.uid,
        name: result.user.displayName || result.user.email || "Unknown",
        email: result.user.email || undefined,
        role: "user",
      };
      // Store user data in Firestore if not already present
      await setDoc(doc(db, "users", result.user.uid), userData, { merge: true });
      setUser(userData);
      setName(userData.name);
      setEmail(userData.email || "");
    } catch (err: any) {
      console.error("Google Sign-In Error:", { code: err.code, message: err.message });
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let firebaseUser;
      if (!user) {
        // If not signed in, create a new user with email and password
        if (password.length < 6) {
          setError("Password must be at least 6 characters long.");
          setIsLoading(false);
          return;
        }
        const result = await createUserWithEmailAndPassword(auth, email, password);
        firebaseUser = result.user;
      } else {
        // Use existing Google-authenticated user
        firebaseUser = auth.currentUser;
      }

      if (!firebaseUser) {
        setError("No authenticated user found.");
        setIsLoading(false);
        return;
      }

      // Store user data with user role
      const userData = {
        id: firebaseUser.uid,
        name,
        email,
        role: "user",
      };
      await setDoc(doc(db, "users", firebaseUser.uid), userData, { merge: true });

      // Submit medical center request
      await addDoc(collection(db, "medicalCenterRequests"), {
        centerName: medicalCenterName,
        userId: firebaseUser.uid,
        userName: name,
        userEmail: email,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      // Update user store
      setUser(userData);

      setSuccess(true);
      setTimeout(() => navigate("/"), 2000); // Redirect after showing success
    } catch (err: any) {
      console.error("Registration Error:", { code: err.code, message: err.message });
      setError(
        err.code === "auth/weak-password"
          ? "Password must be at least 6 characters long."
          : err.message || "Failed to register. Please try again."
      );
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
        <h2 className="text-3xl font-bold neon-text mb-6 text-center">
          MediLink Registration
        </h2>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 bg-red-900/20 border border-red-500/30 p-3 rounded-lg text-center mb-4"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-cyan-400 bg-cyan-900/20 border border-cyan-500/30 p-3 rounded-lg text-center mb-4"
          >
            Request submitted successfully! Redirecting...
          </motion.div>
        )}

        {!user && (
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="cyber-button w-full flex items-center justify-center space-x-2 mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.24 10.493v2.808h4.633c-.186 1.24-.76 2.28-1.704 2.976l2.784 2.136c1.704-1.584 2.688-3.84 2.688-6.312 0-.672-.072-1.32-.192-1.944h-8.209zm-1.128-2.808v2.808h-4.632c.192 1.248.768 2.28 1.704 2.976l-2.784 2.136c-1.704-1.584-2.688-3.84-2.688-6.312 0-.672.072-1.32.192-1.944h8.208zm1.128-2.808c-3.84 0-7.104 2.496-8.304 6h16.608c-1.2-3.504-4.464-6-8.304-6zm0-2.4c5.328 0 9.672 4.344 9.672 9.672s-4.344 9.672-9.672 9.672-9.672-4.344-9.672-9.672 4.344-9.672 9.672-9.672z"
              />
            </svg>
            <span>{isLoading ? "Processing..." : "Sign in with Google"}</span>
          </button>
        )}

        <form onSubmit={handleRegistration} className="space-y-4">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-cyan-400" />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-cyan-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
              required
              disabled={!!user} // Disable email field if user is authenticated
            />
          </div>
          {!user && (
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-cyan-400" />
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-cyan-400" />
            <input
              type="text"
              placeholder="Medical Center Name (Request)"
              value={medicalCenterName}
              onChange={(e) => setMedicalCenterName(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="cyber-button w-full flex items-center justify-center space-x-2"
          >
            <User className="w-5 h-5" />
            <span>{isLoading ? "Submitting..." : "Submit Request"}</span>
          </button>
        </form>

        <p className="mt-4 text-center text-gray-400">
          Already have an account?{" "}
          <a href="/login" className="text-cyan-400 hover:underline">
            Login
          </a>
        </p>
      </div>
    </motion.div>
  );
};

export default Registration;