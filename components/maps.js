"use client";

// Leaflet only works in the browser, so the map components are loaded
// with ssr: false. Import maps from this file, not from RockMap/LocationPicker.
import dynamic from "next/dynamic";

const loading = () => <div className="map-placeholder">Loading map…</div>;

export const RockMap = dynamic(() => import("./RockMap"), { ssr: false, loading });
export const LocationPicker = dynamic(() => import("./LocationPicker"), { ssr: false, loading });
