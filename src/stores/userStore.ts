// src/stores/userStore.ts
import { create } from "zustand";

interface User {
  id: string;
  name: string;
  role: "doctor" | "patient"; // Define roles
}

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null, // Default user is null
  setUser: (user) => set(() => ({ user })),
}));
