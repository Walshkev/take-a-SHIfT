"use client";
import Navbar from "./components/Navbar";
import { useUser } from "../context/userContext";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./services/firebase";


export default function ProfilePage() {
  const { user } = useUser();

  // Timer state and logic (only for logged in users)
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(0); // Track sum of all stopped times
  const intervalRef = useRef(null);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning]);

  const handleStartStop = () => {
    if (timerRunning) {
      // Timer is stopping, add to totalTime
      setTotalTime((prev) => prev + timer);
      setTimer(0);
    }
    setTimerRunning((prev) => !prev);
  };

  const handelSubmit = async () => {
    try {
      // Add a log to users/{uid}/logs subcollection
      const logsRef = collection(db, "users", user.uid, "logs");
      await addDoc(logsRef, {
        totalTime,
        timestamp: new Date(),
      });
      alert(`Submitted total time: ${totalTime} seconds`);
      setTimer(0);
      setTimerRunning(false);
      setTotalTime(0);
    } catch (error) {
      alert("Failed to submit log: " + error.message);
    }
  };

  const handleReset = () => {
    setTimer(0);
    setTimerRunning(false);
    setTotalTime(0); // Optionally reset total time as well
  };

  if (!user) {
    return (
      <div>
        <Navbar />
        <h1>User Profile</h1>
        <p>Log in to see all of the cool features.</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ 
        margin: "40px auto", 
        maxWidth: 600, 
        background: "#222", 
        border: "8px solid #762900", 
        borderRadius: 16, 
        boxShadow: "0 4px 24px #0008", 
        padding: 32, 
        color: "brown", 
        fontFamily: "'Courier New', Courier, monospace",
        textAlign: "center"
      }}>
        <h1 style={{ 
          letterSpacing: 2, 
          fontWeight: "bold", 
          fontSize: 40, 
          marginBottom: 24, 
          textShadow: "2px 2px 0 #000" 
        }}>
          💩 SHIfT METER 💩
        </h1>
        <div style={{
          background: "#111",
          border: "4px inset #762900 ",
          borderRadius: 8,
          padding: "16px 0",
          marginBottom: 24,
          fontSize: 60,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: 2,
          boxShadow: "0 2px 8px #0006"
        }}>
          {timer.toString().padStart(4, "0")} <span style={{fontSize: 18}}>sec</span>
        </div>
        <div style={{ marginBottom: 16 }}>
          <button 
            onClick={handleStartStop} 
            style={{
              background: timerRunning ? "#c00" : "#0c0",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 40,
              fontWeight: "bold",
              padding: "12px 32px",
              marginRight: 12,
              boxShadow: "0 2px 8px #0006",
              cursor: "pointer"
            }}
          >
            {timerRunning ? "STOP" : "START"}
          </button>
          <button 
            onClick={handleReset}
            style={{
              background: "#444",
              color: "#FFD700",
              border: "2px solid #762900",
              borderRadius: 8,
              fontSize: 18,
              padding: "10px 18px",
              marginLeft: 8,
              cursor: "pointer"
            }}
          >
            RESET
          </button>
        </div>
        <div style={{ 
          background: "#fff", 
          borderRadius: 6, 
          padding: "8px 0", 
          marginBottom: 12, 
          fontSize: 20,
          color: "#762900" 
        }}>
          <strong>SHIfT value:</strong>
          <span style={{
            fontWeight: "bold",
            fontSize: 32,
            marginLeft: 10,
            letterSpacing: 1,
            fontFamily: "monospace",
            background: "#ffeeba",
            padding: "2px 12px",
            borderRadius: 6,
            boxShadow: "0 1px 4px #0002"
          }}>
            ${ (timer * user.secondsPay).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) }
          </span>
        </div>
        <div style={{ 
          background: "#fff", 
          borderRadius: 6, 
          padding: "8px 0", 
          marginBottom: 12, 
          fontSize: 20,
          color: "#762900" 
        }}>
          <strong>Total Time:</strong>
          <span style={{
            fontWeight: "bold",
            fontSize: 32,
            marginLeft: 10,
            letterSpacing: 1,
            fontFamily: "monospace",
            background: "#ffeeba",
            padding: "2px 12px",
            borderRadius: 6,
            boxShadow: "0 1px 4px #0002"
          }}>
            {totalTime.toLocaleString()} sec
          </span>
        </div>
        <button 
          onClick={handelSubmit}
          style={{
            background: "#FFD700",
            color: "#222",
            border: "none",
            borderRadius: 8,
            fontSize: 20,
            fontWeight: "bold",
            padding: "10px 32px",
            marginTop: 10,
            boxShadow: "0 2px 8px #0006",
            cursor: "pointer"
          }}
        >
          END SHIfT
        </button>
        <button>
          <Link href="/profile" style={{
            textDecoration: "none",
            color: "#222",
            fontSize: 18,
            marginLeft: 16,
            padding: "8px 16px",
            background: "#762900",
            borderRadius: 8,
            border: "2px solid #762900",
            boxShadow: "0 2px 8px #0006"
          }}>
            View Profile
          </Link>
        </button>
      </div>
    </>
  );
}