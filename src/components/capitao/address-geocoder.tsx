"use client";

import { useState } from "react";
import { LocateFixed } from "lucide-react";

type GeocodeResult = {
  latitude: number;
  longitude: number;
  displayName: string;
};

export function AddressGeocoder({
  formSelector,
  mapContainerId,
}: {
  formSelector: string;
  mapContainerId: string;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function locate() {
    const form = document.querySelector<HTMLFormElement>(formSelector);
    if (!form) return;

    const address = (form.elements.namedItem("address") as HTMLInputElement | null)?.value.trim() ?? "";
    const neighborhood = (form.elements.namedItem("neighborhood") as HTMLInputElement | null)?.value.trim() ?? "";

    if (!address) {
      setMessage("Digite o endereço antes de localizar.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const params = new URLSearchParams({ address });
      if (neighborhood) params.set("neighborhood", neighborhood);

      const response = await fetch(`/api/geocode?${params.toString()}`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      const body = await response.json() as {
        results?: GeocodeResult[];
        error?: string;
      };

      if (!response.ok) {
        setMessage(body.error ?? "Não foi possível localizar este endereço.");
        return;
      }

      const result = body.results?.[0];
      if (!result) {
        setMessage("Endereço não encontrado. Você ainda pode marcar o ponto manualmente.");
        return;
      }

      const latInput = form.elements.namedItem("latitude") as HTMLInputElement | null;
      const lngInput = form.elements.namedItem("longitude") as HTMLInputElement | null;
      const statusInput = form.elements.namedItem("geocoding_status") as HTMLInputElement | null;
      const sourceInput = form.elements.namedItem("geocoding_source") as HTMLInputElement | null;
      const atInput = form.elements.namedItem("geocoded_at") as HTMLInputElement | null;
      const geocodedAt = new Date().toISOString();

      if (latInput) latInput.value = String(result.latitude);
      if (lngInput) lngInput.value = String(result.longitude);
      if (statusInput) statusInput.value = "resolved";
      if (sourceInput) sourceInput.value = "nominatim";
      if (atInput) atInput.value = geocodedAt;

      window.dispatchEvent(new CustomEvent("capitao-map:set-location", {
        detail: {
          containerId: mapContainerId,
          latitude: result.latitude,
          longitude: result.longitude,
          geocodingStatus: "resolved",
          geocodingSource: "nominatim",
          geocodedAt,
        },
      }));

      setMessage(`Local encontrado: ${result.displayName}. Ajuste o pin se necessário.`);
    } catch {
      setMessage("Falha ao consultar o endereço. Marque o ponto manualmente no mapa.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void locate()}
        disabled={busy}
        className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--capitao-primary-100)] px-4 text-xs font-bold text-[var(--capitao-primary-900)] disabled:opacity-50"
      >
        <LocateFixed className="size-4" />
        {busy ? "Localizando…" : "Localizar endereço"}
      </button>
      {message ? (
        <p className="mt-2 text-xs leading-5 text-[var(--capitao-text-secondary)]">{message}</p>
      ) : null}
    </div>
  );
}
