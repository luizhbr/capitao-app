"use client";

import { CapitaoMap } from "@/components/capitao/capitao-map";

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
  return (
    <CapitaoMap
      mode="picker"
      containerId={containerId}
      formSelector={formSelector}
      initialLat={initialLat}
      initialLng={initialLng}
    />
  );
}
