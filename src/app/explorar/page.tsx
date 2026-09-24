import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, MapPinned, Plus, Search } from "lucide-react";
import { BottomNav } from "@/components/capitao/bottom-nav";
import { ListingCard, type DirectoryListing } from "@/components/capitao/listing-card";
import { createClient } from "@/lib/supabase/server";

const categoryMap: Record<string, string | undefined> = {
  todos: undefined,
  comercio: "commerce",
  comida: "food",
  servicos: "services",
  turismo: "tourism",
  "feito-em-capitao": "producer",
  tech: "tech",
};

const categories = [
  ["todos", "Todos"],
  ["comercio", "Comércio"],
  ["comida", "Comida"],
  ["servicos", "Serviços"],
  ["turismo", "Turismo"],
  ["feito-em-capitao", "Feito em Capitão"],
  ["tech", "Tech"],
] as const;

async function getListings(): Promise<DirectoryListing[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("listings")
      .select("id,name,category,description,phone,whatsapp,address,neighborhood")
      .eq("status", "published")
      .eq("is_active", true)
      .order("name")
      .limit(200);

    if (error) return [];
    return (data ?? []) as DirectoryListing[];
  } catch {
    return [];
  }
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export default async function ExplorarPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; busca?: string }>;
}) {
  const params = await searchParams;
  const selected = params.categoria && categoryMap[params.categoria] !== undefined ? params.categoria : (params.categoria === "todos" ? "todos" : "todos");
  const category = categoryMap[selected];
  const query = (params.busca ?? "").trim();
  const normalizedQuery = normalize(query);

  const allListings = await getListings();
  const listings = allListings.filter((item) => {
    if (category && item.category !== category) return false;
    if (!normalizedQuery) return true;
    return normalize([
      item.name,
      item.description,
      item.address,
      item.neighborhood,
    ].filter(Boolean).join(" ")).includes(normalizedQuery);
  });

  return (
    <main className="mx-auto min-h-svh max-w-md px-4 pb-32 pt-6 sm:px-5">
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--capitao-primary-700)]">
          <ArrowLeft className="size-4" /> Início
        </Link>
        <Link href="/explorar/cadastrar" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--capitao-primary-900)] px-4 text-xs font-bold text-white">
          <Plus className="size-4" /> Cadastrar
        </Link>
      </div>

      <header className="mt-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--capitao-primary-500)]">Explorar</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Encontre o que precisa na cidade</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--capitao-text-secondary)]">Comércio, alimentação, serviços, turismo, produtores e tecnologia local.</p>
        <Link href="/explorar/mapa" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--capitao-primary-100)] px-4 text-xs font-bold text-[var(--capitao-primary-900)]">
          <MapPinned className="size-4" /> Ver mapa da cidade
        </Link>
      </header>

      <form className="mt-5 flex gap-2" action="/explorar" method="get">
        {selected !== "todos" ? <input type="hidden" name="categoria" value={selected} /> : null}
        <label className="flex min-h-12 flex-1 items-center gap-2 rounded-2xl border border-black/[0.07] bg-white px-4 shadow-sm">
          <Search className="size-4 text-[var(--capitao-text-secondary)]" />
          <input name="busca" defaultValue={query} placeholder="Buscar por nome, bairro..." className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </label>
        <button className="min-h-12 rounded-2xl bg-[var(--capitao-primary-700)] px-4 text-sm font-bold text-white">Buscar</button>
      </form>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
        {categories.map(([key, label]) => {
          const active = selected === key;
          const href = key === "todos"
            ? (query ? `/explorar?busca=${encodeURIComponent(query)}` : "/explorar")
            : `/explorar?categoria=${key}${query ? `&busca=${encodeURIComponent(query)}` : ""}`;

          return (
            <Link key={key} href={href as Route} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition ${active ? "bg-[var(--capitao-primary-900)] text-white" : "bg-white text-[var(--capitao-text-secondary)] shadow-sm"}`}>
              {label}
            </Link>
          );
        })}
      </div>

      <section className="mt-5 space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold">Resultados</h2>
            <p className="text-xs text-[var(--capitao-text-secondary)]">{listings.length} {listings.length === 1 ? "cadastro encontrado" : "cadastros encontrados"}</p>
          </div>
          {query || selected !== "todos" ? <Link href="/explorar" className="text-xs font-semibold text-[var(--capitao-primary-700)]">Limpar filtros</Link> : null}
        </div>

        {listings.length ? (
          listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)
        ) : (
          <div className="rounded-[var(--radius-card)] bg-white p-6 text-center shadow-[var(--shadow-card)]">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--capitao-primary-100)]">
              <Search className="size-6 text-[var(--capitao-primary-900)]" />
            </div>
            <h3 className="mt-4 font-extrabold">Nenhum cadastro público encontrado</h3>
            <p className="mt-2 text-sm leading-5 text-[var(--capitao-text-secondary)]">O diretório já está conectado ao banco. Cadastros enviados por moradores ficam pendentes até publicação.</p>
            <Link href="/explorar/cadastrar" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--capitao-primary-100)] px-5 text-sm font-bold text-[var(--capitao-primary-900)]">
              Cadastrar negócio ou serviço
            </Link>
          </div>
        )}
      </section>

      <BottomNav />
    </main>
  );
}
