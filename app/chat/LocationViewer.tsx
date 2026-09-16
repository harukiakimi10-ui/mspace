"use client";

import { useEffect, useRef } from "react";
import { ArrowLeft, Minus, Plus, LocateFixed } from "lucide-react";
import "leaflet/dist/leaflet.css";

type LocationViewerProps = {
  latitude: number;
  longitude: number;
  onClose: () => void;
};

export default function LocationViewer({
  latitude,
  longitude,
  onClose,
}: LocationViewerProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    const initializeMap = async () => {
      const container = mapRef.current;

      if (!container) return;

      const L = await import("leaflet");

      if (cancelled) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(container, {
        zoomControl: false,
        attributionControl: true,
      }).setView([latitude, longitude], 16);

      mapInstanceRef.current = map;

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap contributors",
        }
      ).addTo(map);

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

      L.marker([latitude, longitude], {
        icon: locationIcon,
      }).addTo(map);

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
  }, [latitude, longitude]);

  const zoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const zoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const centerLocation = () => {
    mapInstanceRef.current?.setView(
      [latitude, longitude],
      16
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          height: "60px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "0 14px",
          background: "#fff",
          borderBottom: "1px solid #eee",
          boxShadow: "0 1px 5px rgba(0,0,0,0.08)",
        }}
      >
        <button
      onClick={(e) => {
    e.stopPropagation();
    onClose();
  }}
          style={{
            width: "40px",
            height: "40px",
            border: "none",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            borderRadius: "50%",
          }}
        >
          <ArrowLeft size={24} />
        </button>

        <div
          style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "#111",
          }}
        >
          Location
        </div>
      </div>

      {/* MAP */}
      <div
        ref={mapRef}
        style={{
          flex: 1,
          width: "100%",
          minHeight: 0,
        }}
      />

      {/* MAP CONTROLS */}
      <div
  style={{
    position: "absolute",
    right: "16px",
    bottom: "90px",
    zIndex: 10000,
    display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <button
          onClick={zoomIn}
          style={{
            width: "44px",
            height: "44px",
            border: "none",
            borderRadius: "12px",
            background: "#fff",
            boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Plus size={22} />
        </button>

        <button
          onClick={zoomOut}
          style={{
            width: "44px",
            height: "44px",
            border: "none",
            borderRadius: "12px",
            background: "#fff",
            boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Minus size={22} />
        </button>

        <button
          onClick={centerLocation}
          style={{
            width: "44px",
            height: "44px",
            border: "none",
            borderRadius: "12px",
            background: "#fff",
            boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LocateFixed size={21} />
        </button>
      </div>
    </div>
  );
}