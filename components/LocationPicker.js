"use client";

import { MapContainer, TileLayer, CircleMarker, useMapEvents } from "react-leaflet";
import { CAMPUS_CENTER, CAMPUS_ZOOM } from "@/lib/config";

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });
  return null;
}

// Click anywhere on the map to drop (or move) the pin.
export default function LocationPicker({ latitude, longitude, onPick }) {
  const hasPin = latitude != null && longitude != null;

  return (
    <MapContainer
      center={hasPin ? [latitude, longitude] : CAMPUS_CENTER}
      zoom={CAMPUS_ZOOM}
      style={{ height: 320, width: "100%" }}
      className="map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={onPick} />
      {hasPin && (
        <CircleMarker
          center={[latitude, longitude]}
          radius={10}
          pathOptions={{ color: "#7a3e1d", fillColor: "#c26a2e", fillOpacity: 0.85 }}
        />
      )}
    </MapContainer>
  );
}
