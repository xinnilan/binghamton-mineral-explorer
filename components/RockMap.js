"use client";

import Link from "next/link";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { CAMPUS_CENTER, CAMPUS_ZOOM } from "@/lib/config";

// Shows one pin per rock. Rocks without coordinates are skipped.
export default function RockMap({ rocks, center, zoom, height = 420 }) {
  const placed = rocks.filter((r) => r.latitude != null && r.longitude != null);

  return (
    <MapContainer
      center={center ?? CAMPUS_CENTER}
      zoom={zoom ?? CAMPUS_ZOOM}
      style={{ height, width: "100%" }}
      className="map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {placed.map((rock) => (
        <CircleMarker
          key={rock.id}
          center={[rock.latitude, rock.longitude]}
          radius={9}
          pathOptions={{ color: "#7a3e1d", fillColor: "#c26a2e", fillOpacity: 0.85 }}
        >
          <Popup>
            <strong>{rock.name}</strong>
            {rock.location_note && <div>{rock.location_note}</div>}
            <Link href={`/specimens/${rock.id}`}>View details</Link>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
