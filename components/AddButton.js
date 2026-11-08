"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

// The floating "+" button. Only instructors and admins see it.
export default function AddButton({ category }) {
  const { isStaff } = useAuth();
  if (!isStaff) return null;
  const href = category ? `/specimens/new?category=${category}` : "/specimens/new";
  return (
    <Link href={href} className="fab" aria-label="Add a specimen" title="Add a specimen">+</Link>
  );
}
