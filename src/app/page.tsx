import { Bell, BriefcaseBusiness, Map, Search, ShoppingBag, Store, UtensilsCrossed, Wrench } from "lucide-react";
import { BottomNav } from "@/components/capitao/bottom-nav";
import { FeatureCard } from "@/components/capitao/feature-card";
import { ProjectCard } from "@/components/capitao/project-card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto min-h-svh max-w-md px-4 pb-32 pt-[max(18px,env(safe-area-inset-top))] sm:px-5">
      <header className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-full bg-[var(--capitao-primary-100)] font-bold text-[var(--capitao-primary-900)]">CA</div>
          <div><p className="text-xs text-[var(--capitao-text-secondary)]">Bem-vindo ao</p><h1 className="text-lg font-extrabold tracking-tight">CAPITÃO 👋</h1></div>
        </div>
        <div className="flex gap-2">
          <button className="grid size-11 place-items-center rounded-full bg-white shadow-[var(--shadow-card)]" aria-label="Pesquisar"><Search className="size-5" /></button>
          <button className="relative grid size-11 place-items-center rounded-full bg-white shadow-[var(--shadow-card)]" aria-label="Notificações"><Bell className="size-5" /><span className="absolute right-2 top-2 size-2 rounded-full bg-red-500" /></button>
        </div>
      </header>

      <section className="relative overflow-hidden rounded-[var(--radius-featured)] bg-[linear-gradient(135deg,#0b5135,#083d29)] p-6 text-white shadow-[var(--shadow-featured)]">
        <div className="absolute -right-10 -top-10 size-36 rounded-full bg-[#e5b52f]/25 blur-sm" />
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/75">Capitão hoje</p>
        <h2 className="mt-3 max-w-[16rem] text-2xl font-extrabold leading-tight">Uma cidade conectada a oportunidades.</h2>
        <p className="mt-2 max-w-[17rem] text-sm text-white/75">Comércio, serviços, turismo, cooperativas e projetos num só lugar.</p>
        <Button className="mt-5 bg-white text-[var(--capitao-primary-900)] hover:bg-white/90">Explorar cidade</Button>
      </section>

      <section className="mt-7">
        <h2 className="mb-3 text-lg font-extrabold tracking-tight">O que você precisa hoje?</h2>
        <div className="grid grid-cols-2 gap-3">
          <FeatureCard title="Comércio" subtitle="Empresas e lojas" icon={ShoppingBag} tone="commerce" />
          <FeatureCard title="Comida" subtitle="Restaurantes e produtos" icon={UtensilsCrossed} tone="food" />
          <FeatureCard title="Serviços" subtitle="Profissionais da cidade" icon={Wrench} tone="services" />
          <FeatureCard title="Turismo" subtitle="Explore Capitão" icon={Map} tone="tourism" />
        </div>
      </section>

      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-extrabold tracking-tight">Oportunidades</h2><button className="text-xs font-semibold text-[var(--capitao-primary-700)]">Ver todas</button></div>
        <div className="rounded-[var(--radius-card)] bg-white p-4 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--capitao-tech-100)]"><BriefcaseBusiness className="size-7 text-[var(--capitao-tech-600)]" /></div>
            <div><span className="rounded-full bg-[#dff4e7] px-2 py-1 text-[10px] font-bold text-[#237a4b]">FORMAÇÃO</span><p className="mt-2 font-bold">Capitão Tech — primeira turma</p><p className="text-xs text-[var(--capitao-text-secondary)]">Tecnologia aplicada a negócios locais</p></div>
          </div>
        </div>
      </section>

      <section className="mt-7"><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-extrabold tracking-tight">Projetos em destaque</h2><span className="text-xs text-[var(--capitao-text-secondary)]">Capitão 2040</span></div><ProjectCard /></section>

      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-extrabold tracking-tight">Feito em Capitão</h2><button className="text-xs font-semibold text-[var(--capitao-primary-700)]">Ver todos</button></div>
        <div className="grid grid-cols-3 gap-3">
          {["Queijos","Doces","Produtores"].map((item,index)=><div key={item} className="rounded-[18px] bg-white p-3 shadow-[var(--shadow-card)]"><div className={`mb-3 grid aspect-square place-items-center rounded-[15px] ${index===0?"bg-[var(--capitao-solar-100)]":index===1?"bg-[var(--capitao-tourism-100)]":"bg-[var(--capitao-agro-100)]"}`}>{index===2?<Store className="size-6" />:<span className="text-2xl">{index===0?"🧀":"🍯"}</span>}</div><p className="text-xs font-bold">{item}</p></div>)}
        </div>
      </section>
      <BottomNav />
    </main>
  );
}
