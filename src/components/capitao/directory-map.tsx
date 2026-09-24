"use client";

import { CapitaoMap } from "@/components/capitao/capitao-map";
import type { CapitaoMapPoint } from "@/lib/map-types";

export type MapPoint = CapitaoMapPoint;

export function DirectoryMap({
  points,
  containerId,
}: {
  points: MapPoint[];
  containerId: string;
}) {
  return <CapitaoMap mode="directory" points={points} containerId={containerId} />;
}
