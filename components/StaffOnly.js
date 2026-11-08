"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

// Wraps pages that only instructors/admins should use. The database enforces
// this too; this just shows a friendly message instead of an error.
export default function StaffOnly({ children }) {
  const { loading, isStaff, isLoggedIn } = useAuth();
  if (loading) return <p className="muted">Loading…</p>;
  if (!isLoggedIn) return <p>Please <Link href="/login">log in</Link> first.</p>;
  if (!isStaff) return <p>Only instructors can do this.</p>;
  return children;
}
