"use client";

import { useMemo, useState } from "react";
import { ArrowRight, List, MapPinned, Search, X } from "lucide-react";
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
  const [search, setSearch] = useState("");
  const [showList, setShowList] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = search.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
    return points.filter((point) => {
      if (category !== "all" && point.category !== category) return false;
      if (!query) return true;
      const text = [point.name, point.categoryLabel].join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
      return text.includes(query);
    });
  }, [points, category, search]);

  function focusPoint(point: CapitaoMapPoint) {
    setSelectedId(point.id);
    window.dispatchEvent(new CustomEvent("capitao-map:focus-point", {
      detail: { containerId: "directory-map", id: point.id, latitude: point.latitude, longitude: point.longitude },
    }));
    document.getElementById("directory-map")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <section aria-label="Mapa e diretório de Capitão Andrade" className="mt-4">
      <div className="rounded-[24px] border border-black/[0.06] bg-white/95 p-3 shadow-[var(--shadow-card)] sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex min-h-12 min-w-[210px] flex-1 items-center gap-3 rounded-2xl border border-black/[0.07] bg-[#F7F8F5] px-4 focus-within:ring-2 focus-within:ring-[#297A56]" htmlFor="capitao-map-search">
            <Search aria-hidden="true" className="size-4 shrink-0 text-[#297A56]" />
            <input
              id="capitao-map-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar comércio ou categoria"
              className="w-full bg-transparent py-3 text-sm text-[#083D29] outline-none placeholder:text-[#77837B]"
            />
            {search && (
              <button type="button" aria-label="Limpar busca" onClick={() => setSearch("")} className="rounded-full p-1 hover:bg-black/5">
                <X className="size-4" />
              </button>
            )}
          </label>
          <button
            type="button"
            onClick={() => setShowList((value) => !value)}
            aria-pressed={showList}
            className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[#083D29] px-4 text-xs font-bold text-white transition hover:bg-[#0B5135] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#297A56]"
          >
            {showList ? <MapPinned className="size-4" /> : <List className="size-4" />}
            {showList ? "Ocultar lista" : "Ver lista"}
          </button>
        </div>

        <div aria-label="Filtrar por categoria" className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {filters.map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={category === value}
              onClick={() => { setCategory(value); setSelectedId(null); }}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#297A56] ${
                category === value
                  ? "border-[#083D29] bg-[#083D29] text-white shadow-sm"
                  : "border-[#DCE8E0] bg-[#F7FAF8] text-[#325342] hover:bg-[#EAF4ED]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-[#646A67]" aria-live="polite">
          <span className="font-extrabold text-[#083D29]">{filtered.length}</span> {filtered.length === 1 ? "local encontrado" : "locais encontrados"}
          {search ? ` para “${search}”` : ""}
        </p>
      </div>

      <div className="relative mt-3 overflow-hidden rounded-[28px] border border-black/[0.06] bg-[#EAF3EA] shadow-[var(--shadow-featured)]">
        <div id="directory-map" className="h-[62svh] min-h-[430px] w-full" role="region" aria-label="Mapa interativo dos comércios de Capitão Andrade" />
        <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex justify-start">
          <div className="rounded-xl border border-white/90 bg-white/95 px-3 py-2 text-[11px] font-semibold text-[#083D29] shadow-lg backdrop-blur-sm">
            <MapPinned aria-hidden="true" className="mr-1 inline size-3.5" /> Capitão Andrade · MG
          </div>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="mt-4 rounded-2xl border border-dashed border-[#B8D2C2] bg-[#F2F8F4] p-5 text-center">
          <p className="text-sm font-bold text-[#083D29]">Nenhum estabelecimento encontrado</p>
          <p className="mt-1 text-xs text-[#646A67]">Experimente outro nome ou remova os filtros.</p>
          <button type="button" onClick={() => { setSearch(""); setCategory("all"); }} className="mt-3 rounded-full bg-[#DCEDE3] px-4 py-2 text-xs font-bold text-[#083D29]">Limpar filtros</button>
        </div>
      )}

      {showList && filtered.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2" aria-label="Lista de estabelecimentos">
          {filtered.map((point) => (
            <article key={point.id} className={`rounded-2xl border bg-white p-4 shadow-[var(--shadow-card)] transition ${
              selectedId === point.id ? "border-[#297A56] ring-2 ring-[#DCEDE3]" : "border-[#E8EEE9]"
            }`}>
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#297A56]">{point.categoryLabel}</p>
              <h3 className="mt-1 text-sm font-extrabold text-[#083D29]">{point.name}</h3>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => focusPoint(point)} className="text-xs font-bold text-[#0B5135] underline-offset-4 hover:underline">Ver no mapa</button>
                <a href={`/explorar/${encodeURIComponent(point.id)}`} className="inline-flex items-center gap-1 text-xs font-bold text-[#0B5135] hover:underline">
                  Ver perfil <ArrowRight aria-hidden="true" className="size-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
      <CapitaoMap mode="directory" points={filtered} containerId="directory-map" />
    </section>
  );
}
