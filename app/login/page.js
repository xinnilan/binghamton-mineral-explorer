"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else router.push("/");
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) setMessage(error.message);
      else if (!data.session)
        setMessage("Check your email to confirm your account. An instructor will then approve it.");
      else setMessage("Account created. An instructor needs to approve it before you can use the Teaching section.");
    }
    setBusy(false);
  }

  function switchMode() {
    setMode(mode === "login" ? "signup" : "login");
    setMessage("");
  }

  return (
    <div className="narrow">
      <h1>{mode === "login" ? "Log in" : "Create an account"}</h1>
      <form onSubmit={handleSubmit} className="form">
        {mode === "signup" && (
          <label>
            Full name
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </label>
        )}
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" minLength={6} value={password}
            onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button type="submit" disabled={busy}>
          {busy ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
        </button>
      </form>
      {message && <p className="notice">{message}</p>}
      <p>
        {mode === "login" ? "No account yet? " : "Already have an account? "}
        <button className="link-button" onClick={switchMode}>
          {mode === "login" ? "Sign up" : "Log in"}
        </button>
      </p>
    </div>
  );
}
