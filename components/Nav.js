"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

const LINKS = [
  { href: "/rocks", label: "Campus Rocks" },
  { href: "/minerals", label: "Department Minerals" },
  { href: "/search", label: "Search" },
];

export default function Nav() {
  const { isLoggedIn, isAdmin, profile } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  async function logOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <header className="nav">
      <Link href="/" className="brand">Binghamton Mineral Explorer</Link>
      <nav>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={pathname.startsWith(l.href) ? "active" : ""}>
            {l.label}
          </Link>
        ))}
        {isAdmin && (
          <Link href="/admin" className={pathname.startsWith("/admin") ? "active" : ""}>Admin</Link>
        )}
        {isLoggedIn ? (
          <button className="link-button" onClick={logOut} title={profile?.email}>Log out</button>
        ) : (
          <Link href="/login">Log in</Link>
        )}
      </nav>
    </header>
  );
}
