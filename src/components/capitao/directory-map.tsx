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
      const maplibregl = (await import("maplibre-gl")).default;
      if (cancelled || !maplibregl) return;
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
        const popup = new maplibregl.Popup({ offset: 24, closeButton: false }).setHTML(
          `<a href="/explorar/${point.id}" style="font-weight:800;text-decoration:none;color:#0B5135">${point.name}</a><br/><span style="font-size:11px;color:#696E6B">${point.categoryLabel}</span>`,
        );
        new maplibregl.Marker().setLngLat([point.longitude, point.latitude]).setPopup(popup).addTo(map);
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
