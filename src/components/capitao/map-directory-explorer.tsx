"use client";

import { useMemo, useState } from "react";
import { CapitaoMap } from "@/components/capitao/capitao-map";
import type { CapitaoMapPoint } from "@/lib/map-types";

const filters = [
  ["all", "Todos"],
  ["commerce", "Comércio"],
  ["food", "Comida"],
  ["services", "Serviços"],
  ["tourism", "Turismo"],
  ["producer", "Produtores"],
  ["tech", "Tech"],
] as const;

export function MapDirectoryExplorer({ points }: { points: CapitaoMapPoint[] }) {
  const [category, setCategory] = useState<(typeof filters)[number][0]>("all");

  const filtered = useMemo(
    () => category === "all" ? points : points.filter((point) => point.category === category),
    [points, category],
  );

  return (
    <>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
        {filters.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setCategory(value)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition ${
              category === value
                ? "bg-[var(--capitao-primary-900)] text-white"
                : "bg-white text-[var(--capitao-text-secondary)] shadow-sm"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="mt-2 text-xs text-[var(--capitao-text-secondary)]">
        {filtered.length} {filtered.length === 1 ? "local visível" : "locais visíveis"}
      </p>

      <div className="mt-4 overflow-hidden rounded-[var(--radius-featured)] border border-black/[0.05] bg-white shadow-[var(--shadow-featured)]">
        <div id="directory-map" className="h-[62svh] min-h-[430px] w-full" />
      </div>

      <CapitaoMap mode="directory" points={filtered} containerId="directory-map" />
    </>
  );
}
