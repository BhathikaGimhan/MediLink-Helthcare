// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCwvgerlNUuOIDK2TGhRN9j2aygG6CdpAM",
  authDomain: "medilink-6e93a.firebaseapp.com",
  projectId: "medilink-6e93a",
  storageBucket: "medilink-6e93a.firebasestorage.app",
  messagingSenderId: "273101035846",
  appId: "1:273101035846:web:8129e41bda810823b7ad47",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Set authentication persistence to session
setPersistence(auth, browserSessionPersistence).catch((err) => {
  console.error("Error setting Firebase persistence:", err);
});