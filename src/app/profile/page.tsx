"use client";
import Navbar from "../components/Navbar";
import { useUser } from "../../context/userContext";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { useState, useEffect } from "react";
import nextDynamic from "next/dynamic";
const Plot = nextDynamic(() => import("react-plotly.js"), { ssr: false });
import Link from "next/link";

export default function ProfilePage() {
  const { user, fetchUserData } = useUser();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsData, setLogsData] = useState<[Date, number][]>([]);
  const [totalPay, setTotalPay] = useState(0);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    hourlyIncome: user?.hourlyIncome || "",
    annualIncome: user?.annualIncome || "",
  });

  // Helper to get pay per second
  const getPayPerSecond = () => {
    if (user?.hourlyIncome && !user?.annualIncome) {
      return Number(user.hourlyIncome) / 3600;
    }
    if (user?.annualIncome && !user?.hourlyIncome) {
      return Number(user.annualIncome) / 10080000;
    }
    return 0;
  };

  // Fetch logs for chart and total time
  useEffect(() => {
    const fetchLogs = async () => {
      if (!user) return;
      const logsRef = collection(db, "users", user.uid, "logs");
      const snapshot = await getDocs(logsRef);
      const data: [Date, number][] = [];
      let sum = 0;
      snapshot.forEach(doc => {
        const d = doc.data();
        if (typeof d.totalTime === "number" && d.timestamp) {
          const date = d.timestamp.toDate ? d.timestamp.toDate() : new Date(d.timestamp);
          data.push([date, d.totalTime]);
          sum += d.totalTime;
        }
      });
      data.sort((a, b) => a[0].getTime() - b[0].getTime());
      setLogsData(data);
      setLogsTotal(sum);
      setTotalPay(sum * getPayPerSecond());
    };
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleAddToFirebase = async () => {
    setSaving(true);
    try {
      const docId = user.uid || "defaultUser";
      // Only include one of hourlyIncome or annualIncome
      const updatedUser = {
        name: formData.name || "",
        hourlyIncome: formData.hourlyIncome && !formData.annualIncome ? formData.hourlyIncome : "",
        annualIncome: formData.annualIncome && !formData.hourlyIncome ? formData.annualIncome : "",
        secondsPay: formData.hourlyIncome
          ? formData.hourlyIncome / 3600
          : formData.annualIncome
          ? formData.annualIncome / 10080000
          : 0,
        uid: user.uid,
        photoURL: user.photoURL || "",
        email: user.email 
      };
      await setDoc(doc(collection(db, "users"), docId), updatedUser);
      await fetchUserData(docId);
    } catch (error) {
      alert("Error updating profile: " + error);
    }
    setSaving(false);
    setEditing(false);
  };

  // Only allow one of hourlyIncome or annualIncome to be filled at a time
  const handleIncomeChange = (key: string, value: string) => {
    if (key === "hourlyIncome") {
      setFormData({
        ...formData,
        hourlyIncome: value.replace(/[^0-9.]/g, ""),
        annualIncome: "",
      });
    } else if (key === "annualIncome") {
      setFormData({
        ...formData,
        annualIncome: value.replace(/[^0-9.]/g, ""),
        hourlyIncome: "",
      });
    }
  };

  // Calculate money earned for each log
  const getMoney = (seconds: number) => {
    return seconds * getPayPerSecond();
  };

  // Calculate cumulative money earned for the graph
  const cumulativeMoney = (() => {
    let sum = 0;
    return logsData.map(([, value]) => {
      sum += getMoney(value);
      return sum;
    });
  })();

  return (
    <>
      <Navbar />
      <div style={styles.centerContainer}>
        {!editing ? (
          <>
            <h1 style={{ textAlign: "center" }}>User Profile</h1>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <img
                src={user?.photoURL}
                alt="User Avatar"
                style={styles.avatar}
              />

              {["name", "email", "hourlyIncome", "annualIncome"].map((key) => (
                user && user[key] && (
                  <p key={key} style={{ textAlign: "center", margin: 0 }}>
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
                  hourlyIncome: user?.hourlyIncome || "",
                  annualIncome: user?.annualIncome || "",
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
            {Object.entries(formData).map(([key, value]) => {
              if (key === "hourlyIncome" || key === "annualIncome") {
                return (
                  <label key={key} style={styles.label}>
                    <strong>
                      {key === "hourlyIncome" ? "Hourly Income" : "Annual Income"}:
                    </strong>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => handleIncomeChange(key, e.target.value)}
                      style={styles.input}
                      disabled={
                        (key === "hourlyIncome" && formData.annualIncome) ||
                        (key === "annualIncome" && formData.hourlyIncome)
                      }
                    />
                  </label>
                );
              }
              // Default for name/email
              return (
                <label key={key} style={styles.label}>
                  <strong>
                    {key.charAt(0).toUpperCase() + key.slice(1)}:
                  </strong>
                  <input
                    type={key === "email" ? "email" : "text"}
                    value={value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [key]: e.target.value,
                      })
                    }
                    style={styles.input}
                  />
                </label>
              );
            })}

            <button
              onClick={handleAddToFirebase}
              style={styles.saveButton}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setEditing(false)}
              style={styles.cancelButton}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Total Time from logs collection */}
        <div style={{ marginTop: 40, fontWeight: "bold", fontSize: "1.2rem", textAlign: "center" }}>
          Total Time (all logs): {logsTotal} seconds
        </div>
        <div style={{ marginTop: 8, fontWeight: "bold", fontSize: "1.2rem", textAlign: "center" }}>
          Total Pay (all logs): ${totalPay.toFixed(2)}
        </div>
        <div style={{ width: "600px", height: "500px", margin: "24px auto 8px auto" }}>
          <Plot
            data={[
              {
                x: logsData.map(([date]) => date),
                y: cumulativeMoney,
                type: "scatter",
                mode: "lines+markers",
                marker: { color: "blue" },
              },
            ]}
            layout={{
              width: 600,
              height: 400,
              title: "Cumulative Money Earned Over Time",
              xaxis: { title: "Date" },
              yaxis: { title: "Cumulative Money Earned ($)" },
            }}
          />
        </div>
        <Link href="/" >
          <button
            style={{
              marginTop: "0px",
              marginBottom: "8px",
              padding: "12px 32px",
              fontSize: "1.1rem",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Back to Main Page
          </button>
        </Link>
      </div>
    </>
  );
}

// --- Styling ---
const styles = {
  centerContainer: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    width: "100%",
  },
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
export const dynamic = "force-dynamic";