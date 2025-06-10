"use client";
import { createContext, useContext, useState, useEffect } from "react";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { app } from "../app/services/firebase";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  

  // Fetch user data from Firestore by UID and update info
  const fetchUserData = async (uid: string) => {
    const db = getFirestore(app);
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      setUser({ uid, ...userSnap.data() });
      console.log("User data fetched from Firestore:", { uid, ...userSnap.data() });
    }
  };

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, fetch user data from Firestore
        await fetchUserData(firebaseUser.uid);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Log in using Google login
  const loginWithGoogle = async () => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const db = getFirestore(app);
      const userRef = doc(db, "users", result.user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // If user already exists then pull the data from Firestore
        setUser({ uid: result.user.uid, ...userSnap.data() });
      } else {
        // Otherwise create a new user in Firestore with
        // information pulled from Google auth
        const newUser = {
          uid: result.user.uid,
          name: result.user.displayName || "",
          email: result.user.email || "",
          occupation: "",
          Linkedin: "",
          GitHub: "",
          photoURL: result.user.photoURL || "",
        };

        await setDoc(userRef, newUser);
        setUser(newUser);
        fetchUserData(result.user.uid);
        console.log("New user created in Firestore:", newUser);
      }
    } catch (error) {
      console.error("Error during Google login:", error);
      alert("Login failed: " + error.message);
    }
  };

  // Log out user and clear the user's info
  const logout = async () => {
    const auth = getAuth(app);
    setUser(null);
    alert("Logged out successfully");
    try {
      await signOut(auth);
    } catch (error) {
      alert("Logout failed: " + error.message);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isLoggedIn: !!user,
        loginWithGoogle,
        logout,
        fetchUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}