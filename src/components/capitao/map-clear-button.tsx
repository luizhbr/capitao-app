"use client";

import { useEffect } from "react";

export function MapClearButton({ formSelector }: { formSelector: string }) {
  useEffect(() => {
    const btn = document.querySelector<HTMLButtonElement>("[data-map-clear]");
    const form = document.querySelector<HTMLFormElement>(formSelector);
    if (!btn || !form) return;
    function onClick() {
      const lat = form!.elements.namedItem("latitude") as HTMLInputElement | null;
      const lng = form!.elements.namedItem("longitude") as HTMLInputElement | null;
      if (lat) lat.value = "";
      if (lng) lng.value = "";
    }
    btn.addEventListener("click", onClick);
    return () => btn.removeEventListener("click", onClick);
  }, [formSelector]);
  return null;
}
