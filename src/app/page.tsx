import Link from "next/link";
import { Bell, BriefcaseBusiness, Map, Search, ShoppingBag, Store, UtensilsCrossed, Wrench } from "lucide-react";
import { BottomNav } from "@/components/capitao/bottom-nav";
import { FeatureCard } from "@/components/capitao/feature-card";
import { ProjectCard, type PublicProject } from "@/components/capitao/project-card";
import { CapitaoMap } from "@/components/capitao/capitao-map";
import { createClient } from "@/lib/supabase/server";
import { getPublishedMapPoints } from "@/lib/map-data";

async function getFeaturedProject(): Promise<PublicProject | undefined> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return undefined;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("slug,title,summary,status,progress")
      .eq("is_public", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return undefined;
    return data as PublicProject;
  } catch {
    return undefined;
  }
}

export default async function HomePage() {
  const [featuredProject, mapPoints] = await Promise.all([
    getFeaturedProject(),
    getPublishedMapPoints(120),
  ]);

  return (
    <main className="mx-auto min-h-svh max-w-md px-4 pb-32 pt-[max(18px,env(safe-area-inset-top))] sm:px-5">
      <header className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-full bg-[var(--capitao-primary-100)] font-bold text-[var(--capitao-primary-900)]">CA</div>
          <div>
            <p className="text-xs text-[var(--capitao-text-secondary)]">Bem-vindo ao</p>
            <h1 className="text-lg font-extrabold tracking-tight">CAPITÃO 👋</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/explorar" className="grid size-11 place-items-center rounded-full bg-white shadow-[var(--shadow-card)]" aria-label="Pesquisar">
            <Search className="size-5" />
          </Link>
          <Link href="/cidade" className="relative grid size-11 place-items-center rounded-full bg-white shadow-[var(--shadow-card)]" aria-label="Cidade">
            <Bell className="size-5" />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500" />
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden rounded-[var(--radius-featured)] bg-[linear-gradient(135deg,#0b5135,#083d29)] p-6 text-white shadow-[var(--shadow-featured)]">
        <div className="absolute -right-10 -top-10 size-36 rounded-full bg-[#e5b52f]/25 blur-sm" />
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/75">Capitão hoje</p>
        <h2 className="mt-3 max-w-[16rem] text-2xl font-extrabold leading-tight">Uma cidade conectada a oportunidades.</h2>
        <p className="mt-2 max-w-[17rem] text-sm text-white/75">Comércio, serviços, turismo, cooperativas e projetos num só lugar.</p>
        <Link href="/explorar" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-[var(--capitao-primary-900)] transition hover:bg-white/90 active:scale-[0.98]">
          Explorar cidade
        </Link>
      </section>

      <section className="mt-7">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--capitao-primary-500)]">Perto de você</p>
            <h2 className="mt-1 text-lg font-extrabold tracking-tight">Explore Capitão Andrade</h2>
          </div>
          <Link href="/explorar/mapa" className="text-xs font-semibold text-[var(--capitao-primary-700)]">
            Abrir mapa
          </Link>
        </div>

        <div className="overflow-hidden rounded-[var(--radius-featured)] border border-black/[0.05] bg-white shadow-[var(--shadow-featured)]">
          <div id="home-city-map" className="h-72 w-full" />
          <div className="flex items-center justify-between gap-3 border-t border-black/[0.05] px-4 py-3">
            <p className="text-xs text-[var(--capitao-text-secondary)]">
              {mapPoints.length
                ? `${mapPoints.length} ${mapPoints.length === 1 ? "local cadastrado" : "locais cadastrados"}`
                : "Os locais aprovados aparecerão aqui."}
            </p>
            <Link href="/explorar/mapa" className="rounded-full bg-[var(--capitao-primary-100)] px-3 py-2 text-[11px] font-bold text-[var(--capitao-primary-900)]">
              Ver mapa completo
            </Link>
          </div>
        </div>

        <CapitaoMap mode="city" points={mapPoints} containerId="home-city-map" />
      </section>

      <section className="mt-7">
        <h2 className="mb-3 text-lg font-extrabold tracking-tight">O que você precisa hoje?</h2>
        <div className="grid grid-cols-2 gap-3">
          <FeatureCard title="Comércio" subtitle="Empresas e lojas" icon={ShoppingBag} tone="commerce" href="/explorar?categoria=comercio" />
          <FeatureCard title="Comida" subtitle="Restaurantes e produtos" icon={UtensilsCrossed} tone="food" href="/explorar?categoria=comida" />
          <FeatureCard title="Serviços" subtitle="Profissionais da cidade" icon={Wrench} tone="services" href="/explorar?categoria=servicos" />
          <FeatureCard title="Turismo" subtitle="Explore Capitão" icon={Map} tone="tourism" href="/explorar?categoria=turismo" />
        </div>
      </section>

      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold tracking-tight">Oportunidades</h2>
          <Link href="/explorar?categoria=oportunidades" className="text-xs font-semibold text-[var(--capitao-primary-700)]">Ver todas</Link>
        </div>
        <Link href="/explorar?categoria=tech" className="block rounded-[var(--radius-card)] bg-white p-4 shadow-[var(--shadow-card)] transition active:scale-[0.99]">
          <div className="flex items-center gap-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--capitao-tech-100)]">
              <BriefcaseBusiness className="size-7 text-[var(--capitao-tech-600)]" />
            </div>
            <div>
              <span className="rounded-full bg-[#dff4e7] px-2 py-1 text-[10px] font-bold text-[#237a4b]">FORMAÇÃO</span>
              <p className="mt-2 font-bold">Capitão Tech — primeira turma</p>
              <p className="text-xs text-[var(--capitao-text-secondary)]">Tecnologia aplicada a negócios locais</p>
            </div>
          </div>
        </Link>
      </section>

      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold tracking-tight">Projetos em destaque</h2>
          <Link href="/capitao-2040" className="text-xs text-[var(--capitao-text-secondary)]">Capitão 2040</Link>
        </div>
        <ProjectCard project={featuredProject} />
        <p className="mt-2 text-[10px] text-[var(--capitao-text-secondary)]">
          {featuredProject ? "Dados carregados do backend CAPITÃO." : "Prévia local enquanto o backend público não estiver disponível no deploy."}
        </p>
      </section>

      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold tracking-tight">Feito em Capitão</h2>
          <Link href="/explorar?categoria=feito-em-capitao" className="text-xs font-semibold text-[var(--capitao-primary-700)]">Ver todos</Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {["Queijos", "Doces", "Produtores"].map((item, index) => (
            <Link key={item} href={`/explorar?busca=${encodeURIComponent(item)}`} className="rounded-[18px] bg-white p-3 shadow-[var(--shadow-card)] transition active:scale-[0.98]">
              <div className={`mb-3 grid aspect-square place-items-center rounded-[15px] ${index === 0 ? "bg-[var(--capitao-solar-100)]" : index === 1 ? "bg-[var(--capitao-tourism-100)]" : "bg-[var(--capitao-agro-100)]"}`}>
                {index === 2 ? <Store className="size-6" /> : <span className="text-2xl">{index === 0 ? "🧀" : "🍯"}</span>}
              </div>
              <p className="text-xs font-bold">{item}</p>
            </Link>
          ))}
        </div>
      </section>
      <BottomNav />
    </main>
  );
}
