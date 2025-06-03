"use client";
import Navbar from "./components/Navbar";
import { useUser } from "../context/userContext";
import Link from "next/link";

export default function ProfilePage() {
  const { user } = useUser();
//probably not the best way to do it but it works 
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
    <div>
      <Navbar />
      <div>
        <h1>Welcome {user?.name}</h1>
        <p>
          Click {" "}
          <Link href="/profile" style={{ color: "blue", textDecoration: "underline" }}>
            here
          </Link>
          {" "}to view your profile.
        </p>
      </div>
    </div>
  );
}