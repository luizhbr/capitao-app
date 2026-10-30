"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, MapPin, Search, Store, UtensilsCrossed, Wrench, Trees, Sprout, Cpu, X } from "lucide-react";
import { CapitaoMap } from "@/components/capitao/capitao-map";
import type { CapitaoMapPoint } from "@/lib/map-types";

const filters = [
  { value: "all", label: "Todos", Icon: MapPin },
  { value: "commerce", label: "Comércio", Icon: Store },
  { value: "food", label: "Comida", Icon: UtensilsCrossed },
  { value: "services", label: "Serviços", Icon: Wrench },
  { value: "tourism", label: "Turismo", Icon: Trees },
  { value: "producer", label: "Produtores", Icon: Sprout },
  { value: "tech", label: "Tech", Icon: Cpu },
] as const;

type Category = (typeof filters)[number]["value"];

export function MapDirectoryExplorer({ points }: { points: CapitaoMapPoint[] }) {
  const [category, setCategory] = useState<Category>("all");
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLocaleLowerCase("pt-BR");
  const filtered = useMemo(
    () => points.filter((point) =>
      (category === "all" || point.category === category) &&
      (!normalized || `${point.name} ${point.categoryLabel}`.toLocaleLowerCase("pt-BR").includes(normalized))
    ),
    [points, category, normalized],
  );

  return (
    <section className="mt-5 space-y-4" aria-label="Explorar locais no mapa">
      <div className="rounded-[24px] border border-[#0B5135]/10 bg-white/95 p-3 shadow-[0_12px_30px_rgba(8,61,41,.08)] sm:p-4">
        <label htmlFor="capitao-map-search" className="sr-only">Buscar locais por nome ou categoria</label>
        <div className="flex min-h-12 items-center gap-3 rounded-2xl bg-[#F1F6F2] px-4 ring-1 ring-[#0B5135]/[.06] focus-within:ring-2 focus-within:ring-[#297A56]">
          <Search aria-hidden="true" className="size-[18px] shrink-0 text-[#297A56]" />
          <input
            id="capitao-map-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar comércio, serviço ou lugar..."
            className="min-w-0 flex-1 bg-transparent py-3 text-sm text-[#083D29] outline-none placeholder:text-[#646A67]"
            type="search"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Limpar busca" className="rounded-full p-1.5 text-[#646A67] hover:bg-white">
              <X aria-hidden="true" className="size-4" />
            </button>
          )}
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" role="group" aria-label="Filtrar categorias">
          {filters.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              aria-pressed={category === value}
              onClick={() => setCategory(value)}
              className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#297A56] ${category === value
                ? "bg-[#083D29] text-white shadow-[0_4px_12px_rgba(8,61,41,.18)]"
                : "bg-[#F1F6F2] text-[#345C48] hover:bg-[#DCEDE3]"
              }`}
            >
              <Icon aria-hidden="true" className="size-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[28px] border border-[#0B5135]/10 bg-[#EAF0E9] shadow-[0_14px_35px_rgba(8,61,41,.13)]">
        <div id="directory-map" aria-label="Mapa interativo dos estabelecimentos de Capitão Andrade" className="h-[57svh] min-h-[380px] w-full sm:h-[64svh] sm:min-h-[480px]" />
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-white/80 bg-white/95 px-3 py-2 text-xs font-bold text-[#083D29] shadow-lg backdrop-blur-md" role="status" aria-live="polite">
          <MapPin className="mr-1 inline size-3.5 text-[#297A56]" aria-hidden="true" />
          {filtered.length} {filtered.length === 1 ? "local encontrado" : "locais encontrados"}
        </div>
      </div>

      {filtered.length ? (
        <div className="space-y-3">
          <h2 className="text-base font-extrabold text-[#083D29]">Descubra no mapa</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((point) => (
              <Link
                href={`/explorar/${encodeURIComponent(point.id)}`}
                key={point.id}
                className="group flex items-center gap-3 rounded-[20px] border border-[#0B5135]/[.07] bg-white p-3.5 shadow-[0_3px_14px_rgba(8,61,41,.05)] transition hover:-translate-y-0.5 hover:shadow-[0_9px_24px_rgba(8,61,41,.10)] focus-visible:outline-2 focus-visible:outline-[#297A56]"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#DCEDE3] text-[#0B5135]"><MapPin className="size-5" aria-hidden="true" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-extrabold text-[#083D29]">{point.name}</span>
                  <span className="block text-xs text-[#646A67]">{point.categoryLabel}</span>
                </span>
                <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-[#297A56] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-[22px] border border-dashed border-[#0B5135]/20 bg-white px-5 py-8 text-center">
          <MapPin className="mx-auto mb-2 size-7 text-[#297A56]" aria-hidden="true" />
          <h2 className="font-extrabold text-[#083D29]">Nenhum local encontrado</h2>
          <p className="mt-1 text-sm text-[#646A67]">{points.length ? "Tente outro nome ou escolha uma categoria diferente." : "Os comércios aparecerão aqui após o cadastro e a aprovação."}</p>
          {(category !== "all" || query) && (
            <button type="button" onClick={() => { setCategory("all"); setQuery(""); }} className="mt-4 rounded-full bg-[#083D29] px-5 py-2.5 text-xs font-bold text-white">Limpar filtros</button>
          )}
        </div>
      )}
      <CapitaoMap mode="directory" points={filtered} containerId="directory-map" />
    </section>
  );
}
