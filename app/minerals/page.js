"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import SpecimenCard from "@/components/SpecimenCard";
import AddButton from "@/components/AddButton";

export default function MineralsPage() {
  const [minerals, setMinerals] = useState(null);
  const [room, setRoom] = useState("");
  const [teachingOnly, setTeachingOnly] = useState(false);

  useEffect(() => {
    supabase.from("specimens").select("*").eq("category", "department_mineral").order("name")
      .then(({ data }) => setMinerals(data ?? []));
  }, []);

  if (minerals === null) return <p className="muted">Loading…</p>;

  const rooms = [...new Set(minerals.map((m) => m.room_number).filter(Boolean))].sort();
  const shown = minerals.filter(
    (m) => (!room || m.room_number === room) && (!teachingOnly || m.used_for_teaching)
  );

  return (
    <div>
      <h1>Department Minerals</h1>
      <div className="filters">
        <label>
          Room{" "}
          <select value={room} onChange={(e) => setRoom(e.target.value)}>
            <option value="">All rooms</option>
            {rooms.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={teachingOnly} onChange={(e) => setTeachingOnly(e.target.checked)} />
          Used for teaching only
        </label>
      </div>
      <p className="muted">{shown.length} of {minerals.length} minerals</p>
      <div className="grid">
        {shown.map((m) => (
          <SpecimenCard key={m.id} specimen={m}>
            {m.used_for_teaching && <span className="badge teaching">Teaching</span>}
          </SpecimenCard>
        ))}
      </div>
      <AddButton category="department_mineral" />
    </div>
  );
}
