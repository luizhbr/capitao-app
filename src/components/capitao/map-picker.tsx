"use client";

import { useEffect, useRef } from "react";

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
      const maplibregl = await import("maplibre-gl");
      if (cancelled) return;

      const container = document.getElementById(containerId);
      const form = document.querySelector<HTMLFormElement>(formSelector);
      if (!container || !form) return;

      const latInput = form.elements.namedItem("latitude") as HTMLInputElement | null;
      const lngInput = form.elements.namedItem("longitude") as HTMLInputElement | null;

      const hasInitial = initialLat != null && initialLng != null;
      const map = new maplibregl.Map({
        container,
        center: hasInitial ? [initialLng, initialLat] : [-41.68, -18.85],
        zoom: hasInitial ? 15 : 12,
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

      const syncInputs = (lng: number, lat: number) => {
        if (latInput) latInput.value = lat.toFixed(6);
        if (lngInput) lngInput.value = lng.toFixed(6);
      };

      const attachDraggableMarker = (lng: number, lat: number) => {
        const marker = new maplibregl.Marker({ draggable: true })
          .setLngLat([lng, lat])
          .addTo(map);

        marker.on("dragend", () => {
          const pos = marker.getLngLat();
          syncInputs(pos.lng, pos.lat);
        });

        markerRef.current = marker;
        return marker;
      };

      map.on("click", (event: import("maplibre-gl").MapMouseEvent) => {
        const { lng, lat } = event.lngLat;
        syncInputs(lng, lat);

        if (!markerRef.current) {
          attachDraggableMarker(lng, lat);
        } else {
          markerRef.current.setLngLat([lng, lat]);
        }
      });

      if (hasInitial) {
        attachDraggableMarker(initialLng, initialLat);
      }

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    }

    void boot();

    return () => {
      cancelled = true;
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [containerId, formSelector, initialLat, initialLng]);

  return null;
}
