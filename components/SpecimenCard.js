import Link from "next/link";
import { imageUrl } from "@/lib/supabase";

export default function SpecimenCard({ specimen, children }) {
  const src = imageUrl(specimen.image_path);
  const subtitle =
    specimen.category === "campus_rock" ? specimen.location_note : specimen.room_number && `Room ${specimen.room_number}`;

  return (
    <div className="card specimen-card">
      <Link href={`/specimens/${specimen.id}`}>
        {src ? (
          <img src={src} alt={specimen.name} className="thumb" />
        ) : (
          <div className="thumb no-image">No image</div>
        )}
        <h3>{specimen.name}</h3>
      </Link>
      {specimen.catalog_number && <p className="muted small">#{specimen.catalog_number}</p>}
      {subtitle && <p className="muted small">{subtitle}</p>}
      {children}
    </div>
  );
}
