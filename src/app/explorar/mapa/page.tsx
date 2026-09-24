import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPublishedMapPoints } from "@/lib/map-data";
import { MapDirectoryExplorer } from "@/components/capitao/map-directory-explorer";

export const dynamic = "force-dynamic";

export default async function ExplorarMapaPage() {
  const points = await getPublishedMapPoints(500);

  return (
    <main className="mx-auto min-h-svh max-w-5xl px-4 pb-20 pt-6 sm:px-6">
      <Link href="/explorar" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--capitao-primary-700)]">
        <ArrowLeft className="size-4" /> Explorar
      </Link>

      <header className="mt-6 max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--capitao-primary-500)]">Explorar</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Mapa da cidade</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--capitao-text-secondary)]">
          Veja os comércios, serviços, produtores e pontos cadastrados em Capitão Andrade.
        </p>
      </header>

      <MapDirectoryExplorer points={points} />
    </main>
  );
}
