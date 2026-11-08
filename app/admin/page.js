"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";

const ROLES = ["pending", "student", "instructor", "admin"];

export default function AdminPage() {
  const { loading, isAdmin, profile: me } = useAuth();
  const [users, setUsers] = useState(null);

  const load = useCallback(() => {
    supabase.from("profiles").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setUsers(data ?? []));
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  async function setRole(userId, role) {
    const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
    if (error) alert(error.message);
    else load();
  }

  if (loading) return <p className="muted">Loading…</p>;
  if (!isAdmin) return <p>Only admins can see this page.</p>;
  if (users === null) return <p className="muted">Loading…</p>;

  const pending = users.filter((u) => u.role === "pending");
  const others = users.filter((u) => u.role !== "pending");

  return (
    <div>
      <h1>Admin: users</h1>

      <h2>Waiting for approval ({pending.length})</h2>
      {pending.length === 0 && <p className="muted">Nobody is waiting.</p>}
      <ul className="user-list">
        {pending.map((u) => (
          <li key={u.id}>
            <div>
              <strong>{u.full_name || "(no name)"}</strong>
              <div className="muted small">{u.email}</div>
            </div>
            <div className="row">
              <button onClick={() => setRole(u.id, "student")}>Approve as student</button>
              <button onClick={() => setRole(u.id, "instructor")}>Approve as instructor</button>
            </div>
          </li>
        ))}
      </ul>

      <h2>All users</h2>
      <ul className="user-list">
        {others.map((u) => (
          <li key={u.id}>
            <div>
              <strong>{u.full_name || "(no name)"}</strong>
              <div className="muted small">{u.email}</div>
            </div>
            <select value={u.role} disabled={u.id === me?.id}
              onChange={(e) => setRole(u.id, e.target.value)} aria-label={`Role for ${u.email}`}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
}
