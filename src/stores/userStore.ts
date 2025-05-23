// src/stores/userStore.ts
import { create } from "zustand";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

interface User {
  id: string;
  name: string;
  email?: string;
  role: string;
}

interface UserStore {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  initializeAuth: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  initializeAuth: () => {
    set({ isLoading: true }); // Set loading true when initializing
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            set({
              user: {
                id: firebaseUser.uid,
                name: userData.name || firebaseUser.displayName || "Unknown",
                email: userData.email || firebaseUser.email,
                role: userData.role || "patient",
              },
              isLoading: false,
            });
          } else {
            // If no user document exists, set default user data
            set({
              user: {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || "Unknown",
                email: firebaseUser.email || undefined,
                role: "patient",
              },
              isLoading: false,
            });
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          set({ user: null, isLoading: false });
        }
      } else {
        set({ user: null, isLoading: false });
      }
    });
    // Return unsubscribe to clean up the listener (optional, can be called later if needed)
    return () => unsubscribe();
  },
}));