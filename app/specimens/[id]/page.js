"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase, imageUrl, IMAGE_BUCKET } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { RockMap } from "@/components/maps";
import QRCodeBox from "@/components/QRCodeBox";

export default function SpecimenPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isStaff, session } = useAuth();
  const [specimen, setSpecimen] = useState(undefined); // undefined = loading, null = not found

  // Re-fetch when the user logs in/out, since what they may see changes.
  useEffect(() => {
    supabase.from("specimens").select("*").eq("id", id).maybeSingle()
      .then(({ data }) => setSpecimen(data));
  }, [id, session?.user?.id]);

  async function handleDelete() {
    if (!confirm(`Delete "${specimen.name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("specimens").delete().eq("id", specimen.id);
    if (error) return alert(error.message);
    if (specimen.image_path) await supabase.storage.from(IMAGE_BUCKET).remove([specimen.image_path]);
    router.push(specimen.category === "campus_rock" ? "/rocks" : "/minerals");
  }

  if (specimen === undefined) return <p className="muted">Loading…</p>;
  if (specimen === null) return <p>Specimen not found.</p>;

  const isRock = specimen.category === "campus_rock";
  const src = imageUrl(specimen.image_path);
  const hasPin = specimen.latitude != null && specimen.longitude != null;

  return (
    <article className="detail">
      <p className="muted small">
        <Link href={isRock ? "/rocks" : "/minerals"}>
          ← {isRock ? "Campus Rocks" : "Department Minerals"}
        </Link>
      </p>
      <h1>{specimen.name}</h1>
      <p>
        <span className="badge">{isRock ? "Campus rock" : "Department mineral"}</span>
        {specimen.used_for_teaching && <span className="badge teaching">Used for teaching</span>}
        {specimen.catalog_number && <span className="muted"> #{specimen.catalog_number}</span>}
      </p>

      {src && <img src={src} alt={specimen.name} className="detail-image" />}

      <h2>Description</h2>
      <p className="description">{specimen.description || <span className="muted">No description yet.</span>}</p>

      {isRock ? (
        <>
          <h2>Location</h2>
          {specimen.location_note && <p>{specimen.location_note}</p>}
          {hasPin ? (
            <RockMap rocks={[specimen]} center={[specimen.latitude, specimen.longitude]} height={300} />
          ) : (
            <p className="muted">No map location yet.</p>
          )}
          {isStaff && (
            <>
              <h2>QR code</h2>
              <QRCodeBox specimen={specimen} />
            </>
          )}
        </>
      ) : (
        <>
          <h2>Location</h2>
          <p>{specimen.room_number ? `Room ${specimen.room_number}` : <span className="muted">No room listed.</span>}</p>
        </>
      )}

      {isStaff && (
        <div className="row actions">
          <Link href={`/specimens/${specimen.id}/edit`} className="button">Edit</Link>
          <button className="danger" onClick={handleDelete}>Delete</button>
        </div>
      )}
    </article>
  );
}
