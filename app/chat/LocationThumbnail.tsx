"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

type LocationThumbnailProps = {
  latitude: number;
  longitude: number;
};

export default function LocationThumbnail({
  latitude,
  longitude,
}: LocationThumbnailProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    const initializeMap = async () => {
      if (!mapRef.current) return;

      const L = await import("leaflet");

      if (cancelled || !mapRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        touchZoom: false,
        zoomSnap: 1,
      }).setView(
        [latitude, longitude],
        15
      );

      mapInstanceRef.current = map;

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
        }
      ).addTo(map);

      const locationIcon = L.divIcon({
        className: "",
        html: `
          <div style="
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            filter: drop-shadow(0 2px 3px rgba(0,0,0,.35));
          ">
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 2.5
                   C8.5 2.5 4.5 6.8 4.5 12
                   C4.5 18.2 14 25.5 14 25.5
                   C14 25.5 23.5 18.2 23.5 12
                   C23.5 6.8 19.5 2.5 14 2.5Z"
                fill="#6d28d9"
                stroke="#ffffff"
                stroke-width="2"
              />
              <circle
                cx="14"
                cy="12"
                r="4"
                fill="#ffffff"
              />
            </svg>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker(
        [latitude, longitude],
        {
          icon: locationIcon,
          interactive: false,
        }
      ).addTo(map);

      setTimeout(() => {
        if (!cancelled) {
          map.invalidateSize();
        }
      }, 50);
    };

    initializeMap();

    return () => {
      cancelled = true;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude]);

  return (
    <div
      style={{
        width: "48px",
        height: "48px",
        flexShrink: 0,
        borderRadius: "8px",
        overflow: "hidden",
        background: "#e9e3f7",
        position: "relative",
      }}
    >
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}