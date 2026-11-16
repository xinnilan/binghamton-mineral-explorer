"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import SpecimenCard from "@/components/SpecimenCard";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    // Commas and parentheses have special meaning in Supabase filters, so drop them.
    const q = query.replace(/[,()%]/g, " ").trim();
    if (!q) return setResults(null);

    const pattern = `%${q}%`;
    const { data } = await supabase
      .from("specimens")
      .select("*")
      .or(
        ["name", "catalog_number", "description", "location_note", "room_number",
          "formula", "crystal_system", "member_of"]
          .map((field) => `${field}.ilike.${pattern}`)
          .join(",")
      )
      .order("name")
      .limit(100);
    setResults(data ?? []);
  }

  return (
    <div>
      <h1>Search</h1>
      <form onSubmit={handleSearch} className="search-bar">
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Name, ID number, formula, group, room…" aria-label="Search" />
        <button type="submit">Search</button>
      </form>
      {results && (
        <>
          <p className="muted">{results.length} result{results.length === 1 ? "" : "s"}</p>
          <div className="grid">
            {results.map((s) => (
              <SpecimenCard key={s.id} specimen={s}>
                <span className="badge">{s.category === "campus_rock" ? "Campus rock" : "Mineral"}</span>
              </SpecimenCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
