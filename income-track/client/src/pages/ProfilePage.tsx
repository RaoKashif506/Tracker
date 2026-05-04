import { useEffect, useState } from "react";
import { api } from "../api";

export function ProfilePage({ onLogout }: { onLogout: () => void }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/profile").then((r) => {
      setFullName(r.data.data.user.fullName);
      setEmail(r.data.data.user.email);
    });
  }, []);

  async function saveProfile() {
    await api.patch("/profile", { fullName, email });
    setMessage("Profile updated.");
  }

  async function changePassword() {
    await api.post("/profile/change-password", {
      currentPassword,
      newPassword,
      confirmPassword
    });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("Password updated.");
  }

  async function logout() {
    await api.post("/auth/logout");
    onLogout();
  }

  return (
    <div className="grid">
      <div className="card">
        <h2>Profile</h2>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <button onClick={saveProfile}>Save profile</button>
      </div>
      <div className="card">
        <h2>Change password</h2>
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" />
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" />
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" />
        <button onClick={changePassword}>Update password</button>
        <button onClick={logout}>Logout</button>
      </div>
      {message ? <p>{message}</p> : null}
    </div>
  );
}
