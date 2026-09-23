"use client";

import { useEffect, useRef } from "react";

export type MapPoint = {
  id: string;
  name: string;
  categoryLabel: string;
  latitude: number;
  longitude: number;
};

/** Directory map: one pin per published listing with coordinates. */
export function DirectoryMap({
  points,
  containerId,
}: {
  points: MapPoint[];
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

      const center: [number, number] = points.length
        ? [points[0].longitude, points[0].latitude]
        : [-41.68, -18.85];

      const map = new maplibregl.Map({
        container,
        center,
        zoom: points.length ? 13 : 12,
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

      for (const point of points) {
        const popupContent = document.createElement("div");
        const link = document.createElement("a");
        link.href = `/explorar/${encodeURIComponent(point.id)}`;
        link.textContent = point.name;
        link.style.fontWeight = "800";
        link.style.textDecoration = "none";
        link.style.color = "#0B5135";

        const subtitle = document.createElement("span");
        subtitle.textContent = point.categoryLabel;
        subtitle.style.fontSize = "11px";
        subtitle.style.color = "#696E6B";

        popupContent.append(link, document.createElement("br"), subtitle);

        const popup = new maplibregl.Popup({
          offset: 24,
          closeButton: false,
        }).setDOMContent(popupContent);

        new maplibregl.Marker()
          .setLngLat([point.longitude, point.latitude])
          .setPopup(popup)
          .addTo(map);
      }
    }

    void boot();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [points, containerId]);

  return null;
}
