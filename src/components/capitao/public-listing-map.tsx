"use client";

import { useEffect, useRef } from "react";

/** Static mini map with a marker for the public listing page. */
export function PublicListingMap({
  lat,
  lng,
  containerId,
}: {
  lat: number;
  lng: number;
  containerId: string;
}) {
  const mapRef = useRef<import("maplibre-gl").Map | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const maplibregl = await import("maplibre-gl");
      if (cancelled) return;

      const container = document.getElementById(containerId);
      if (!container) return;

      const map = new maplibregl.Map({
        container,
        center: [lng, lat],
        zoom: 15,
        interactive: false,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "© OpenStreetMap contributors",
            },
          },
          layers: [{ id: "osm", type: "raster", source: "osm" }],
        },
      });

      mapRef.current = map;
      new maplibregl.Marker().setLngLat([lng, lat]).addTo(map);
    }

    void boot();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [lat, lng, containerId]);

  return null;
}
