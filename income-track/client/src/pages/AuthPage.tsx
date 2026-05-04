import { useState } from "react";
import { api } from "../api";

export function AuthPage({ onAuth }: { onAuth: () => void }) {
  const [signup, setSignup] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    try {
      if (signup) {
        await api.post("/auth/signup", { fullName, email, password });
      } else {
        await api.post("/auth/login", { email, password });
      }
      onAuth();
    } catch (e: any) {
      setError(e?.response?.data?.error?.message ?? "Authentication failed");
    }
  }

  return (
    <div className="card">
      <h2>{signup ? "Sign up" : "Login"}</h2>
      {signup ? <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" /> : null}
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
      <button onClick={submit}>{signup ? "Create account" : "Login"}</button>
      <button className="link" onClick={() => setSignup((s) => !s)}>
        {signup ? "Have an account? Login" : "Need an account? Sign up"}
      </button>
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
