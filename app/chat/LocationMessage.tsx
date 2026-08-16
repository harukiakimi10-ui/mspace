"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

type LocationMessageProps = {
  msg: any;
  currentUser: string;
  formatTime: (date: string) => string;
};

export default function LocationMessage({
  msg,
  currentUser,
  formatTime,
}: LocationMessageProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);

  const isMine = msg.sender === currentUser;

  // Get latitude and longitude from the saved Google Maps URL
  const getCoordinates = () => {
    try {
      const url = new URL(msg.content);
      const q = url.searchParams.get("q");

      if (!q) return null;

      const [lat, lng] = q.split(",").map(Number);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
      }

      return {
        latitude: lat,
        longitude: lng,
      };
    } catch {
      return null;
    }
  };

  useEffect(() => {
    let cancelled = false;

    const initializeMap = async () => {
      const container = mapRef.current;

      if (!container) return;

      const coordinates = getCoordinates();

      if (!coordinates) return;

      // Load Leaflet only in the browser
      const L = await import("leaflet");

      if (cancelled) return;

      // Remove an existing map before creating a new one
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(container, {
        zoomControl: false,
        attributionControl: true,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        touchZoom: false,
      }).setView(
        [coordinates.latitude, coordinates.longitude],
        16
      );

      mapInstanceRef.current = map;

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          attribution:
  '&copy; OpenStreetMap contributors',
        }
      ).addTo(map);


      const attribution = map.attributionControl;

attribution.setPosition("bottomleft");

      // Location pin
      const locationIcon = L.divIcon({
        className: "",
        html: `
          <div style="
            width: 42px;
            height: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 38px;
            line-height: 1;
            filter: drop-shadow(0 2px 3px rgba(0,0,0,0.35));
          ">
            📍
          </div>
        `,
        iconSize: [42, 42],
        iconAnchor: [21, 40],
      });

      L.marker(
        [coordinates.latitude, coordinates.longitude],
        {
          icon: locationIcon,
        }
      ).addTo(map);

      // Open the location in Maps when the map is tapped
      map.on("click", () => {
        const googleMapsUrl =
          `https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`;

        window.open(
          googleMapsUrl,
          "_blank",
          "noopener,noreferrer"
        );
      });

      // Make sure Leaflet calculates the correct size
      setTimeout(() => {
        if (!cancelled) {
          map.invalidateSize();
        }
      }, 100);
    };

    initializeMap();

    return () => {
      cancelled = true;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [msg.content]);

  return (
    <div
      style={{
        width: "min(330px, 75vw)",
        marginLeft: isMine ? "auto" : "0",
        marginRight: isMine ? "0" : "auto",
        marginTop: "4px",
        marginBottom: "6px",
        borderRadius: "18px",
        overflow: "hidden",
        position: "relative",
        background: "#f5f5f5",
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        cursor: "pointer",
      }}
    >
      {/* MAP */}
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "180px",
        }}
      />

      {/* TIME + CHECK */}
      <div
        style={{
          position: "absolute",
          right: "8px",
          bottom: "8px",
          zIndex: 1000,
          background: "rgba(0,0,0,0.48)",
          color: "#fff",
          borderRadius: "12px",
          padding: "3px 8px",
          fontSize: "12px",
          lineHeight: "18px",
          display: "flex",
          alignItems: "center",
          gap: "3px",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
        }}
      >
        <span>
          {formatTime(msg.created_at)}
        </span>

        {isMine && (
          <span
            style={{
              fontSize: "14px",
              lineHeight: "14px",
            }}
          >
            ✓
          </span>
        )}
      </div>
    </div>
  );
}