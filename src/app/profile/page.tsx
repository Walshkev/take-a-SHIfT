"use client";
import Navbar from "../components/Navbar";
import { useUser } from "../../context/userContext";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useState } from "react";

export default function ProfilePage() {
  const { user, fetchUserData } = useUser();

  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    occupation: user?.occupation || "",
    Linkedin: user?.Linkedin || "",
    GitHub: user?.GitHub || "",

  });

  const handleAddToFirebase = async () => {
    try {
      const docId = user.uid || "defaultUser";
      const updatedUser = {
        name: formData.name || "",
        email: formData.email || "",
        occupation: formData.occupation || "",
        Linkedin: formData.Linkedin || "",
        GitHub: formData.GitHub || "",
        photoURL: user.photoURL || "",
        uid: user.uid,
      };
      await setDoc(doc(collection(db, "users"), docId), updatedUser);
      await fetchUserData(docId);
      
    
    } catch (error) {
      alert("Error updating profile: " + error);
    }
    setEditing(false);
  };

  return (
    <>
      <Navbar />

      {!editing ? (
        <>
          <h1>User Profile</h1>
          <div>
            <img
              src={user?.photoURL}
              alt="User Avatar"
              style={styles.avatar}
            />
            
            {["name", "email", "occupation", "Linkedin", "GitHub"].map((key) => (
              user && user[key] && (
              <p key={key}>
                <strong>
                {key.charAt(0).toUpperCase() + key.slice(1)}:
                </strong>{" "}
                {String(user[key])}
              </p>
              )
            ))}
          </div>
          <button
            onClick={() => {
              setFormData({
                name: user?.name || "",
                email: user?.email || "",
                occupation: user?.occupation || "",
                Linkedin: user?.Linkedin || "",
                GitHub: user?.GitHub || "",
              });
              setEditing(true);
            }}
            style={styles.editButton}
          >
            Edit
          </button>
        </>
      ) : (
        <div style={styles.editContainer}>
          <h1 style={styles.editTitle}>Edit User Profile</h1>
          {Object.entries(formData).map(([key, value]) => (
            <label key={key} style={styles.label}>
              <strong>
                {key.charAt(0).toUpperCase() + key.slice(1)}:
              </strong>
              <input
                type={key === "email" ? "email" : "text"}
                value={value}
                onChange={(e) =>
                  setFormData({ ...formData, [key]: e.target.value })
                }
                style={styles.input}
              />
            </label>
          ))}
          <button
            onClick={handleAddToFirebase}
            style={styles.saveButton}
          >
           Save
          </button>
          <button
            onClick={() => setEditing(false)}
            style={styles.cancelButton}
          >
            cancel
          </button>
        </div>
      )}
    </>
  );
}

// --- Styling ---
const styles = {
  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
  },
  editButton: {
    padding: "12px 32px",
    fontSize: "1.2rem",
    borderRadius: "8px",
    marginTop: "16px",
  },
  editContainer: {
    fontSize: "1.15rem",
  },
  editTitle: {
    fontSize: "2rem",
  },
  label: {
    display: "block",
    marginBottom: "12px",
  },
  input: {
    marginLeft: "12px",
    fontSize: "1.15rem",
    padding: "8px 12px",
    borderRadius: "6px",
    width: "300px",
  },
  saveButton: {
    padding: "16px 40px",
    fontSize: "1.3rem",
    borderRadius: "10px",
    marginTop: "20px",
  },
  cancelButton: {
    padding: "16px 40px",
    fontSize: "1.3rem",
    borderRadius: "10px",
    marginLeft: "20px",
    marginTop: "16px",
  },
};