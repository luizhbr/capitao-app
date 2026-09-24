"use client";

import { useEffect, useRef } from "react";
import type { CapitaoMapPoint } from "@/lib/map-types";

type CapitaoMapMode = "city" | "directory" | "listing" | "picker";

type SetLocationDetail = {
  containerId: string;
  latitude: number;
  longitude: number;
  geocodingStatus?: "resolved" | "manual";
  geocodingSource?: "nominatim" | "manual" | "import";
  geocodedAt?: string;
};

const CITY_CENTER: [number, number] = [-41.68, -18.85];
const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

const markerTone: Record<string, string> = {
  commerce: "#0B5135",
  food: "#E88A3D",
  services: "#4F68D9",
  tourism: "#E5B52F",
  producer: "#6B8951",
  tech: "#7255B8",
};

const markerGlyph: Record<string, string> = {
  commerce: "●",
  food: "●",
  services: "●",
  tourism: "●",
  producer: "●",
  tech: "●",
};

function makeMarkerElement(point?: CapitaoMapPoint, picker = false) {
  const el = document.createElement("button");
  el.type = "button";
  el.setAttribute("aria-label", picker ? "Local selecionado" : point?.name ?? "Local");
  el.style.width = picker ? "34px" : "32px";
  el.style.height = picker ? "34px" : "32px";
  el.style.borderRadius = "999px 999px 999px 4px";
  el.style.transform = "rotate(-45deg)";
  el.style.border = "3px solid rgba(255,255,255,.95)";
  el.style.background = picker ? "#083D29" : markerTone[point?.category ?? ""] ?? "#0B5135";
  el.style.boxShadow = "0 8px 22px rgba(8,61,41,.25)";
  el.style.display = "grid";
  el.style.placeItems = "center";
  el.style.cursor = picker ? "grab" : "pointer";
  el.style.padding = "0";

  const dot = document.createElement("span");
  dot.textContent = picker ? "•" : markerGlyph[point?.category ?? ""] ?? "•";
  dot.style.transform = "rotate(45deg)";
  dot.style.color = "#fff";
  dot.style.fontSize = picker ? "22px" : "16px";
  dot.style.lineHeight = "1";
  el.appendChild(dot);

  return el;
}

function applyCapitaoTheme(map: import("maplibre-gl").Map) {
  const style = map.getStyle();
  for (const layer of style.layers ?? []) {
    const id = layer.id.toLowerCase();

    try {
      if (layer.type === "background") {
        map.setPaintProperty(layer.id, "background-color", "#F7F8F5");
      } else if (layer.type === "fill") {
        if (/water/.test(id)) {
          map.setPaintProperty(layer.id, "fill-color", "#DDF1F7");
        } else if (/park|grass|wood|forest|landcover|landuse|natural/.test(id)) {
          map.setPaintProperty(layer.id, "fill-color", "#E6EFDD");
          map.setPaintProperty(layer.id, "fill-opacity", 0.72);
        } else if (/building/.test(id)) {
          map.setPaintProperty(layer.id, "fill-color", "#ECEFEC");
        }
      } else if (layer.type === "symbol") {
        if (map.getPaintProperty(layer.id, "text-color") !== undefined) {
          map.setPaintProperty(layer.id, "text-color", "#646A67");
        }
        if (map.getPaintProperty(layer.id, "text-halo-color") !== undefined) {
          map.setPaintProperty(layer.id, "text-halo-color", "#F7F8F5");
        }
      }
    } catch {
      // Some vector layers use expressions that cannot be replaced safely.
    }
  }
}

export function CapitaoMap({
  mode,
  points = [],
  containerId,
  formSelector,
  initialLat,
  initialLng,
}: {
  mode: CapitaoMapMode;
  points?: CapitaoMapPoint[];
  containerId: string;
  formSelector?: string;
  initialLat?: number | null;
  initialLng?: number | null;
}) {
  const mapRef = useRef<import("maplibre-gl").Map | null>(null);
  const pickerMarkerRef = useRef<import("maplibre-gl").Marker | null>(null);
  const markersRef = useRef<import("maplibre-gl").Marker[]>([]);

  useEffect(() => {
    let cancelled = false;
    let map: import("maplibre-gl").Map | null = null;

    async function boot() {
      const maplibregl = await import("maplibre-gl");
      if (cancelled) return;

      const container = document.getElementById(containerId);
      if (!container) return;

      const hasInitial = initialLat != null && initialLng != null;
      const firstPoint = points[0];
      const initialCenter: [number, number] = hasInitial
        ? [initialLng!, initialLat!]
        : firstPoint
          ? [firstPoint.longitude, firstPoint.latitude]
          : CITY_CENTER;

      map = new maplibregl.Map({
        container,
        center: initialCenter,
        zoom: mode === "listing" || hasInitial ? 15 : points.length ? 13 : 12,
        style: MAP_STYLE,
        interactive: mode !== "listing",
        scrollZoom: mode === "directory" || mode === "picker",
        cooperativeGestures: mode === "directory",
        attributionControl: true,
      });

      mapRef.current = map;

      map.on("load", () => {
        if (!map) return;
        applyCapitaoTheme(map);

        if (mode === "picker") {
          const form = formSelector ? document.querySelector<HTMLFormElement>(formSelector) : null;

          const syncInputs = (
            lng: number,
            lat: number,
            status: "resolved" | "manual" = "manual",
            source: "nominatim" | "manual" | "import" = "manual",
            geocodedAt = new Date().toISOString(),
          ) => {
            if (!form) return;
            const latInput = form.elements.namedItem("latitude") as HTMLInputElement | null;
            const lngInput = form.elements.namedItem("longitude") as HTMLInputElement | null;
            const statusInput = form.elements.namedItem("geocoding_status") as HTMLInputElement | null;
            const sourceInput = form.elements.namedItem("geocoding_source") as HTMLInputElement | null;
            const atInput = form.elements.namedItem("geocoded_at") as HTMLInputElement | null;

            if (latInput) latInput.value = lat.toFixed(6);
            if (lngInput) lngInput.value = lng.toFixed(6);
            if (statusInput) statusInput.value = status;
            if (sourceInput) sourceInput.value = source;
            if (atInput) atInput.value = geocodedAt;
          };

          const setPickerMarker = (
            lng: number,
            lat: number,
            metadata?: Pick<SetLocationDetail, "geocodingStatus" | "geocodingSource" | "geocodedAt">,
          ) => {
            if (!map) return;

            if (!pickerMarkerRef.current) {
              const marker = new maplibregl.Marker({
                element: makeMarkerElement(undefined, true),
                draggable: true,
                anchor: "bottom",
              })
                .setLngLat([lng, lat])
                .addTo(map);

              marker.on("dragend", () => {
                const pos = marker.getLngLat();
                syncInputs(pos.lng, pos.lat, "manual", "manual");
              });

              pickerMarkerRef.current = marker;
            } else {
              pickerMarkerRef.current.setLngLat([lng, lat]);
            }

            syncInputs(
              lng,
              lat,
              metadata?.geocodingStatus ?? "manual",
              metadata?.geocodingSource ?? "manual",
              metadata?.geocodedAt,
            );
          };

          map.on("click", (event: import("maplibre-gl").MapMouseEvent) => {
            setPickerMarker(event.lngLat.lng, event.lngLat.lat, {
              geocodingStatus: "manual",
              geocodingSource: "manual",
            });
          });

          const onSetLocation = (event: Event) => {
            const detail = (event as CustomEvent<SetLocationDetail>).detail;
            if (!detail || detail.containerId !== containerId || !map) return;
            setPickerMarker(detail.longitude, detail.latitude, detail);
            map.flyTo({ center: [detail.longitude, detail.latitude], zoom: 16, essential: true });
          };

          const onClearLocation = (event: Event) => {
            const detail = (event as CustomEvent<{ containerId: string }>).detail;
            if (!detail || detail.containerId !== containerId) return;
            pickerMarkerRef.current?.remove();
            pickerMarkerRef.current = null;
          };

          window.addEventListener("capitao-map:set-location", onSetLocation);
          window.addEventListener("capitao-map:clear-location", onClearLocation);

          if (hasInitial) {
            setPickerMarker(initialLng!, initialLat!, {
              geocodingStatus: "manual",
              geocodingSource: "manual",
            });
          }

          map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

          map.once("remove", () => {
            window.removeEventListener("capitao-map:set-location", onSetLocation);
            window.removeEventListener("capitao-map:clear-location", onClearLocation);
          });

          return;
        }

        const bounds = new maplibregl.LngLatBounds();

        for (const point of points) {
          const marker = new maplibregl.Marker({
            element: makeMarkerElement(point),
            anchor: "bottom",
          }).setLngLat([point.longitude, point.latitude]);

          if (mode !== "listing") {
            const popupContent = document.createElement("div");
            popupContent.style.minWidth = "160px";

            const link = document.createElement("a");
            link.href = `/explorar/${encodeURIComponent(point.id)}`;
            link.textContent = point.name;
            link.style.fontWeight = "800";
            link.style.textDecoration = "none";
            link.style.color = "#083D29";
            link.style.fontFamily = "Manrope, sans-serif";

            const subtitle = document.createElement("div");
            subtitle.textContent = point.categoryLabel;
            subtitle.style.fontSize = "11px";
            subtitle.style.marginTop = "3px";
            subtitle.style.color = "#646A67";

            popupContent.append(link, subtitle);
            marker.setPopup(
              new maplibregl.Popup({ offset: 26, closeButton: false, className: "capitao-map-popup" })
                .setDOMContent(popupContent),
            );
          }

          marker.addTo(map);
          markersRef.current.push(marker);
          bounds.extend([point.longitude, point.latitude]);
        }

        if (points.length > 1) {
          map.fitBounds(bounds, { padding: 46, maxZoom: mode === "city" ? 13.5 : 15, duration: 0 });
        }

        if (mode === "directory") {
          map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
        }
      });
    }

    void boot();

    return () => {
      cancelled = true;
      pickerMarkerRef.current?.remove();
      pickerMarkerRef.current = null;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [mode, points, containerId, formSelector, initialLat, initialLng]);

  return null;
}
