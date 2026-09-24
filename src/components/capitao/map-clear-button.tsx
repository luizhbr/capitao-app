"use client";

import { useEffect } from "react";

export function MapClearButton({
  formSelector,
  containerId,
}: {
  formSelector: string;
  containerId: string;
}) {
  useEffect(() => {
    const btn = document.querySelector<HTMLButtonElement>("[data-map-clear]");
    const form = document.querySelector<HTMLFormElement>(formSelector);
    if (!btn || !form) return;

    function onClick() {
      for (const name of ["latitude", "longitude", "geocoding_status", "geocoding_source", "geocoded_at"]) {
        const input = form.elements.namedItem(name) as HTMLInputElement | null;
        if (input) input.value = "";
      }

      window.dispatchEvent(new CustomEvent("capitao-map:clear-location", {
        detail: { containerId },
      }));
    }

    btn.addEventListener("click", onClick);
    return () => btn.removeEventListener("click", onClick);
  }, [formSelector, containerId]);

  return null;
}
