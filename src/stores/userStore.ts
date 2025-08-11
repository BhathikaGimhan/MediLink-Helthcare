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
    set({ isLoading: true });
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
                email: userData.email || firebaseUser.email || undefined,
                role: userData.role || "patient",
              },
              isLoading: false,
            });
          } else {
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
          console.error('Error fetching user data:', err);
          set({ user: null, isLoading: false });
        }
      } else {
        set({ user: null, isLoading: false });
      }
    }, (err) => {
      console.error('Auth state change error:', err);
      set({ user: null, isLoading: false });
    });
    return () => unsubscribe();
  },
}));