// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA7rXHGjU6vtaL6_KB0tjHlZd2-JU2HihE",
  authDomain: "take-a-shift.firebaseapp.com",
  projectId: "take-a-shift",
  storageBucket: "take-a-shift.firebasestorage.app",
  messagingSenderId: "421386350816",
  appId: "1:421386350816:web:e13b46bb2c930025086085"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };