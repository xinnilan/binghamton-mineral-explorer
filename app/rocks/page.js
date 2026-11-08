"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { RockMap } from "@/components/maps";
import SpecimenCard from "@/components/SpecimenCard";
import AddButton from "@/components/AddButton";

export default function RocksPage() {
  const [rocks, setRocks] = useState(null);

  useEffect(() => {
    supabase.from("specimens").select("*").eq("category", "campus_rock").order("name")
      .then(({ data }) => setRocks(data ?? []));
  }, []);

  return (
    <div>
      <h1>Campus Rocks</h1>
      {rocks === null ? (
        <p className="muted">Loading…</p>
      ) : (
        <>
          <RockMap rocks={rocks} />
          <h2>All rocks ({rocks.length})</h2>
          {rocks.length === 0 && <p className="muted">No rocks added yet.</p>}
          <div className="grid">
            {rocks.map((r) => <SpecimenCard key={r.id} specimen={r} />)}
          </div>
        </>
      )}
      <AddButton category="campus_rock" />
    </div>
  );
}
