"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  SendHorizontal,
  MapPin,
  Search,
  Loader2,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

const language =
  typeof navigator !== "undefined" &&
  navigator.language.startsWith("zh")
    ? "zh"
    : "en";

const t = {
  en: {
    sendLocation: "Send Location",
    searchPlace: "Search for a place",
    nearbyPlaces: "Nearby places",
    findingNearby: "Finding nearby places...",
    noNearby: "No nearby places found.",
    nearbyPlace: "Nearby place",
    cancel: "Cancel",
    send: "Send",
  },

  zh: {
    sendLocation: "发送位置",
    searchPlace: "搜索地点",
    nearbyPlaces: "附近地点",
    findingNearby: "正在查找附近地点...",
    noNearby: "未找到附近地点。",
    nearbyPlace: "附近地点",
    cancel: "取消",
    send: "发送",
  },
}[language];

type LocationPreviewProps = {
  latitude: number;
  longitude: number;
  onCancel: () => void;
  onSend: (latitude: number, longitude: number) => void | Promise<void>;
};

export default function LocationPreview({
  latitude,
  longitude,
  onCancel,
  onSend,
}: LocationPreviewProps) {

    const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
const [loadingNearby, setLoadingNearby] = useState(false);
const [selectedPlaceIndex, setSelectedPlaceIndex] = useState<number | null>(null);
const [selectedNearbyPlaceIndex, setSelectedNearbyPlaceIndex] =
  useState<number | null>(null);


  const mapRef = useRef<HTMLDivElement | null>(null);
const mapInstanceRef = useRef<any>(null);
const markerRef = useRef<any>(null);

  const selectedLocationRef = useRef({
    latitude,
    longitude,
  });

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

      selectedLocationRef.current = {
        latitude,
        longitude,
      };

      const map = L.map(mapRef.current, {
        zoomControl: true,

        attributionControl: true,

        // ENABLE MAP MOVEMENT
        dragging: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        touchZoom: true,
      }).setView(
        [latitude, longitude],
        16
      );

      mapInstanceRef.current = map;

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          attribution:
            "&copy; OpenStreetMap contributors",
        }
      ).addTo(map);


      const locationIcon = L.divIcon({
        className: "",
        html: `
          <div style="
            width: 46px;
            height: 46px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 42px;
            line-height: 1;
            filter: drop-shadow(
              0 3px 4px rgba(0,0,0,.35)
            );
          ">
            📍
          </div>
        `,
        iconSize: [46, 46],
        iconAnchor: [23, 44],
      });

      const marker = L.marker(
        [latitude, longitude],
        {
          icon: locationIcon,
          draggable: true,
        }
      ).addTo(map);

      markerRef.current = marker;

      /*
       * When the user drags the pin,
       * update the selected location.
       */
      marker.on("dragend", () => {
        const position = marker.getLatLng();

        selectedLocationRef.current = {
          latitude: position.lat,
          longitude: position.lng,
        };
      });

      /*
       * Tapping the map moves the pin
       * to that location.
       */
      map.on("click", (event: any) => {
        const { lat, lng } = event.latlng;

        marker.setLatLng([lat, lng]);

        selectedLocationRef.current = {
          latitude: lat,
          longitude: lng,
        };
      });

      setTimeout(() => {
        if (!cancelled) {
          map.invalidateSize();
        }
      }, 100);

      loadNearbyPlaces(
  latitude,
  longitude
);
    };

    initializeMap();

    return () => {
      cancelled = true;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      markerRef.current = null;

    };
  }, [latitude, longitude]);

  const searchLocations = async () => {
    const query = searchQuery.trim();

    if (!query) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(
          query
        )}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Location search failed");
      }

      const results = await response.json();

      setSearchResults(results || []);
    } catch (error) {
      console.error(
        "Location search error:",
        error
      );

      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };


  const loadNearbyPlaces = async (
  lat: number,
  lng: number
) => {
  try {
    setLoadingNearby(true);

    const query = `
      [out:json];
      (
        node["amenity"](around:3000,${lat},${lng});
        node["shop"](around:3000,${lat},${lng});
        node["tourism"](around:3000,${lat},${lng});
        node["leisure"](around:3000,${lat},${lng});
      );
      out center tags;
    `;

    const response = await fetch(
      "https://overpass-api.de/api/interpreter",
      {
        method: "POST",
        body: query,
        headers: {
          "Content-Type":
            "text/plain;charset=UTF-8",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        "Nearby places request failed"
      );
    }

    const data = await response.json();

    const places = (data.elements || [])
      .filter(
        (place: any) =>
          place.tags?.name
      )
      .slice(0, 15);

    setNearbyPlaces(places);
  } catch (error) {
    console.error(
      "Nearby places error:",
      error
    );

    setNearbyPlaces([]);
  } finally {
    setLoadingNearby(false);
  }
};

  const handleSend = async () => {
    const location = selectedLocationRef.current;

    await onSend(
      location.latitude,
      location.longitude
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 3000,
        background: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}

      <div
        style={{
          height: 64,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 18px",
          background: "#fff",
          borderBottom: "1px solid #eee",
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#111",
          }}
        >
          {t.sendLocation}
        </div>

        <button
          type="button"
          onClick={onCancel}
          aria-label="Close location preview"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "none",
            background: "#f3f3f3",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <X size={22} color="#444" />
        </button>
      </div>

      {/* MAP + SEARCH */}

<div
  style={{
    flex: 1,
    minHeight: 0,
    width: "100%",
    position: "relative",
  }}
>
  {/* SEARCH BAR */}
  <div
    style={{
      position: "absolute",
      top: 14,
      left: 14,
      right: 14,
      zIndex: 1000,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        height: 50,
        padding: "0 12px",
        background: "#fff",
        borderRadius: 14,
        boxShadow:
          "0 4px 16px rgba(0,0,0,.18)",
      }}
    >
      <Search
        size={20}
        color="#777"
      />

      <input
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);

          if (!e.target.value.trim()) {
            setSearchResults([]);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            searchLocations();
          }
        }}
        placeholder={t.searchPlace}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          fontSize: 15,
          color: "#222",
          background: "transparent",
        }}
      />

      {searching && (
        <div
          style={{
            width: 18,
            height: 18,
            border: "2px solid #ddd",
            borderTop:
              "2px solid #6d28d9",
            borderRadius: "50%",
            animation:
              "locationSearchSpin 0.8s linear infinite",
          }}
        />
      )}

      {searchQuery && !searching && (
        <button
          type="button"
          onClick={() => {
            setSearchQuery("");
            setSearchResults([]);
          }}
          style={{
            border: "none",
            background: "transparent",
            padding: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <X
            size={18}
            color="#888"
          />
        </button>
      )}
    </div>

    {/* SEARCH RESULTS */}

    {searchResults.length > 0 && (
      <div
        style={{
          marginTop: 8,
          background: "#fff",
          borderRadius: 14,
          overflow: "hidden",
          boxShadow:
            "0 8px 24px rgba(0,0,0,.18)",
        }}
      >
        {searchResults.map(
          (result, index) => (
            <button
              key={`${result.place_id}-${index}`}
              type="button"
              onClick={() => {
  const lat = Number(result.lat);
  const lng = Number(result.lon);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    return;
  }

  // Mark this place as selected
  setSelectedPlaceIndex(index);

  // Save selected location
  selectedLocationRef.current = {
    latitude: lat,
    longitude: lng,
  };

  // Move the existing marker
  if (markerRef.current) {
    markerRef.current.setLatLng([lat, lng]);
  }

  // Move the map to the selected place
  if (mapInstanceRef.current) {
    mapInstanceRef.current.setView(
      [lat, lng],
      17,
      {
        animate: true,
      }
    );
  }

  // Show the selected place name in the search box
  setSearchQuery(result.display_name);

  // Close search results
  setSearchResults([]);

  // Load nearby places around the selected location
  loadNearbyPlaces(lat, lng);
}}
              style={{
                width: "100%",
                border: "none",
                borderBottom:
                  index <
                  searchResults.length - 1
                    ? "1px solid #eee"
                    : "none",
                background:
  selectedPlaceIndex === index
    ? "#f0e7ff"
    : "#fff",
    borderLeft:
  selectedPlaceIndex === index
    ? "4px solid #7c3aed"
    : "4px solid transparent",
                padding: "13px 14px",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <MapPin
                size={18}
                color="#6d28d9"
                style={{
                  flexShrink: 0,
                  marginTop: 2,
                }}
              />

              <span
                style={{
                  fontSize: 14,
                  color: "#333",
                  lineHeight: 1.35,
                }}
              >
                {result.display_name}
              </span>
            </button>
          )
        )}
      </div>
    )}
  </div>

  {/* LEAFLET MAP */}

  <div
    ref={mapRef}
    style={{
      width: "100%",
      height: "100%",
    }}
  />
</div>

<style jsx>{`
  @keyframes locationSearchSpin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
`}</style>


{/* NEARBY PLACES */}

<div
  style={{
    flexShrink: 0,
    background: "#fff",
    padding: "14px 16px 4px",
    maxHeight: "320px",
    overflowY: "auto",
    borderTop: "1px solid #eee",
  }}
>
  <div
    style={{
      fontSize: 16,
      fontWeight: 700,
      color: "#111",
      marginBottom: 10,
    }}
  >
    {t.nearbyPlaces}
  </div>

  {loadingNearby && (
    <div
      style={{
        fontSize: 13,
        color: "#888",
        padding: "8px 0 12px",
      }}
    >
      {t.findingNearby}
    </div>
  )}

  {!loadingNearby &&
    nearbyPlaces.length === 0 && (
      <div
        style={{
          fontSize: 13,
          color: "#888",
          padding: "8px 0 12px",
        }}
      >
        {t.noNearby}
      </div>
    )}

  {!loadingNearby &&
    nearbyPlaces.map(
      (place: any, index: number) => {
        const placeLat =
          place.lat ??
          place.center?.lat;

        const placeLng =
          place.lon ??
          place.center?.lon;

        return (
          <button
            key={`${place.id}-${index}`}
            type="button"
            onClick={() => {
              if (
                !Number.isFinite(
                  Number(placeLat)
                ) ||
                !Number.isFinite(
                  Number(placeLng)
                )
              ) {
                return;
              }

              const lat =
                Number(placeLat);

              const lng =
                Number(placeLng);

                setSelectedNearbyPlaceIndex(index);

              markerRef.current?.setLatLng([
                lat,
                lng,
              ]);

              mapInstanceRef.current?.setView(
                [lat, lng],
                17,
                {
                  animate: true,
                }
              );

              selectedLocationRef.current = {
                latitude: lat,
                longitude: lng,
              };
            }}
            style={{
              width: "100%",
              border: "none",
              borderBottom:
                "1px solid #eee",
             background:
  selectedNearbyPlaceIndex === index
    ? "#f0e7ff"
    : "#fff",
borderLeft:
  selectedNearbyPlaceIndex === index
    ? "4px solid #7c3aed"
    : "4px solid transparent",

              padding: "10px 2px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "#f0eaff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <MapPin
                size={19}
                color="#6d28d9"
              />
            </div>

            <div
              style={{
                minWidth: 0,
                flex: 1,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#222",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                {place.tags?.name}
              </div>

              <div
                style={{
                  marginTop: 2,
                  fontSize: 12,
                  color: "#888",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                {place.tags?.amenity ||
                  place.tags?.shop ||
                  place.tags?.tourism ||
                  place.tags?.leisure ||
                  t.nearbyPlace}
              </div>
            </div>
          </button>
        );
      }
    )}
</div>

 {/* Location information */}

      <div
        style={{
          flexShrink: 0,
          background: "#fff",
          padding: "16px",
          paddingBottom:
            "max(16px, env(safe-area-inset-bottom))",
          borderTop: "1px solid #eee",
          boxShadow:
            "0 -5px 20px rgba(0,0,0,.08)",
        }}
      >


        {/* Buttons */}

        <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  }}
>
          <button
            type="button"
            onClick={onCancel}
            style={{
              width: 100,
              height: 50,
              borderRadius: 14,
              border: "1px solid #ddd",
              background: "#fff",
              color: "#444",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t.cancel}
          </button>

          <button
            type="button"
            onClick={handleSend}
            style={{
              width: 100,
              height: 50,
              borderRadius: 14,
              border: "none",
              background:
                "linear-gradient(135deg,#7c3aed,#6d28d9)",
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow:
                "0 6px 16px rgba(109,40,217,.25)",
            }}
          >
            <SendHorizontal size={18} />
            {t.send}
          </button>
        </div>
      </div>
    </div>
  );
}