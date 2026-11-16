"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CRYSTAL_SYSTEMS, crystalSystemLabel } from "@/lib/mineralogy";
import SpecimenCard from "@/components/SpecimenCard";
import AddButton from "@/components/AddButton";

const GROUP_OPTIONS = [
  { value: "", label: "No grouping (A–Z)" },
  { value: "crystal_system", label: "Crystal system" },
  { value: "member_of", label: "Member of" },
  { value: "room_number", label: "Room" },
];

const NOT_SPECIFIED = "Not specified";

// Splits minerals into [heading, minerals] sections for the chosen field.
function groupMinerals(minerals, field) {
  const groups = new Map();
  for (const m of minerals) {
    const key = m[field] || NOT_SPECIFIED;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(m);
  }
  const order = (key) => {
    if (key === NOT_SPECIFIED) return Infinity; // always last
    if (field === "crystal_system") return CRYSTAL_SYSTEMS.findIndex((s) => s.value === key);
    return 0;
  };
  return [...groups.entries()]
    .sort(([a], [b]) => order(a) - order(b) || a.localeCompare(b))
    .map(([key, items]) => [
      field === "crystal_system" && key !== NOT_SPECIFIED ? crystalSystemLabel(key) : key,
      items,
    ]);
}

function MineralGrid({ minerals }) {
  return (
    <div className="grid">
      {minerals.map((m) => (
        <SpecimenCard key={m.id} specimen={m}>
          {m.used_for_teaching && <span className="badge teaching">Teaching</span>}
        </SpecimenCard>
      ))}
    </div>
  );
}

export default function MineralsPage() {
  const [minerals, setMinerals] = useState(null);
  const [room, setRoom] = useState("");
  const [crystalSystem, setCrystalSystem] = useState("");
  const [teachingOnly, setTeachingOnly] = useState(false);
  const [groupBy, setGroupBy] = useState("");

  useEffect(() => {
    supabase.from("specimens").select("*").eq("category", "department_mineral").order("name")
      .then(({ data }) => setMinerals(data ?? []));
  }, []);

  if (minerals === null) return <p className="muted">Loading…</p>;

  const rooms = [...new Set(minerals.map((m) => m.room_number).filter(Boolean))].sort();
  const shown = minerals.filter(
    (m) =>
      (!room || m.room_number === room) &&
      (!crystalSystem || m.crystal_system === crystalSystem) &&
      (!teachingOnly || m.used_for_teaching)
  );

  return (
    <div>
      <h1>Department Minerals</h1>
      <div className="filters">
        <label>
          Group by{" "}
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            {GROUP_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label>
          Crystal system{" "}
          <select value={crystalSystem} onChange={(e) => setCrystalSystem(e.target.value)}>
            <option value="">All</option>
            {CRYSTAL_SYSTEMS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
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

      {groupBy ? (
        groupMinerals(shown, groupBy).map(([heading, items]) => (
          <section key={heading}>
            <h2>{heading} <span className="muted small">({items.length})</span></h2>
            <MineralGrid minerals={items} />
          </section>
        ))
      ) : (
        <MineralGrid minerals={shown} />
      )}
      <AddButton category="department_mineral" />
    </div>
  );
}
