"use client";

import { useEffect } from "react";

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
  useEffect(() => {
    let cancelled = false;
    async function boot() {
      const maplibregl = (await import("maplibre-gl")).default;
      if (cancelled || !maplibregl) return;
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
      new maplibregl.Marker().setLngLat([lng, lat]).addTo(map);
    }
    void boot();
    return () => {
      cancelled = true;
    };
  }, [lat, lng, containerId]);
  return null;
}
