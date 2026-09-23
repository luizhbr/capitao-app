"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    maplibregl?: unknown;
  }
}

/**
 * MapLibre picker for Capitão Andrade/MG. Loads maplibre-gl from the bundle and
 * an OSM raster style (no Google Maps). Writes chosen coords into hidden inputs
 * named "latitude"/"longitude" inside the provided form.
 */
export function MapPicker({
  containerId,
  formSelector,
  initialLat,
  initialLng,
}: {
  containerId: string;
  formSelector: string;
  initialLat?: number | null;
  initialLng?: number | null;
}) {
  const markerRef = useRef<import("maplibre-gl").Marker | null>(null);
  const mapRef = useRef<import("maplibre-gl").Map | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const maplibregl = (await import("maplibre-gl")).default;
      if (cancelled || !maplibregl) return;

      const container = document.getElementById(containerId);
      const form = document.querySelector<HTMLFormElement>(formSelector);
      if (!container || !form) return;

      const latInput = form.elements.namedItem("latitude") as HTMLInputElement | null;
      const lngInput = form.elements.namedItem("longitude") as HTMLInputElement | null;

      const map = new maplibregl.Map({
        container,
        center: (initialLat && initialLng ? [initialLng, initialLat] : [-41.68, -18.85]) as [number, number],
        zoom: initialLat && initialLng ? 15 : 12,
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

      map.on("click", (e) => {
        const { lng, lat } = e.lngLat;
        if (latInput) latInput.value = lat.toFixed(6);
        if (lngInput) lngInput.value = lng.toFixed(6);
        if (!markerRef.current) {
          markerRef.current = new maplibregl.Marker({ draggable: true }).setLngLat([lng, lat]).addTo(map);
          markerRef.current.on("dragend", () => {
            const pos = markerRef.current?.getLngLat();
            if (pos && latInput && lngInput) {
              latInput.value = pos.lat.toFixed(6);
              lngInput.value = pos.lng.toFixed(6);
            }
          });
        } else {
          markerRef.current.setLngLat([lng, lat]);
        }
      });

      if (initialLat && initialLng) {
        markerRef.current = new maplibregl.Marker({ draggable: true })
          .setLngLat([initialLng, initialLat])
          .addTo(map);
      }

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    }

    void boot();
    return () => {
      cancelled = true;
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [containerId, formSelector, initialLat, initialLng]);

  return null;
}
