"use client";

import { CapitaoMap } from "@/components/capitao/capitao-map";

export function PublicListingMap({
  lat,
  lng,
  containerId,
  id = "listing",
  name = "Estabelecimento",
  category = "commerce",
  categoryLabel = "Local",
}: {
  lat: number;
  lng: number;
  containerId: string;
  id?: string;
  name?: string;
  category?: string;
  categoryLabel?: string;
}) {
  return (
    <CapitaoMap
      mode="listing"
      containerId={containerId}
      points={[{
        id,
        name,
        category,
        categoryLabel,
        latitude: lat,
        longitude: lng,
      }]}
    />
  );
}
