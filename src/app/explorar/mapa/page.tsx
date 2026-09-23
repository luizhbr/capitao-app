import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/security/public-config";
import { DirectoryMap } from "@/components/capitao/directory-map";

export const dynamic = "force-dynamic";

type MapListing = {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
};

const categoryLabels: Record<string, string> = {
  commerce: "Comércio",
  food: "Comida",
  services: "Serviços",
  tourism: "Turismo",
  producer: "Feito em Capitão",
  tech: "Tecnologia",
};

async function getMappedListings(): Promise<MapListing[]> {
  if (!supabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("listings")
      .select("id,name,category,latitude,longitude")
      .eq("status", "published")
      .eq("is_active", true)
      .not("latitude", "is", null)
      .not("longitude", "is", null)
      .limit(300);
    if (error) return [];
    return (data ?? []).filter(
      (l): l is MapListing =>
        typeof (l as MapListing).latitude === "number" &&
        typeof (l as MapListing).longitude === "number",
    );
  } catch {
    return [];
  }
}

export default async function ExplorarMapaPage() {
  const listings = await getMappedListings();
  const points = listings.map((l) => ({
    ...l,
    categoryLabel: categoryLabels[l.category] ?? l.category,
  }));

  return (
    <main className="mx-auto min-h-svh max-w-md px-4 pb-32 pt-6 sm:px-5">
      <Link href="/explorar" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--capitao-primary-700)]">
        <ArrowLeft className="size-4" /> Explorar
      </Link>

      <header className="mt-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--capitao-primary-500)]">Explorar</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Mapa da cidade</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--capitao-text-secondary)]">
          {points.length === 0
            ? "Nenhum negócio com localização definida ainda."
            : `${points.length} negócio(s) no mapa de Capitão Andrade/MG.`}
        </p>
      </header>

      <div className="mt-5 overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-card)]">
        <div id="directory-map" className="h-[60svh] w-full" />
      </div>

      <DirectoryMap points={points} containerId="directory-map" />
    </main>
  );
}
