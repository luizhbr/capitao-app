import Link from "next/link";
import { ArrowLeft, Sun } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type Project = {
  slug: string;
  title: string;
  summary: string | null;
  status: string;
  progress: number;
};

async function loadProjects(): Promise<Project[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("slug,title,summary,status,progress")
      .eq("is_public", true)
      .order("updated_at", { ascending: false });

    if (error) return [];
    return (data ?? []) as Project[];
  } catch {
    return [];
  }
}

export default async function Capitao2040Page() {
  const projects = await loadProjects();

  return (
    <main className="mx-auto min-h-svh max-w-md px-5 py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--capitao-primary-700)]">
        <ArrowLeft className="size-4" /> Voltar
      </Link>

      <div className="mt-8">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--capitao-primary-500)]">CAPITÃO 2040</p>
        <h1 className="mt-2 text-3xl font-extrabold">Projetos da cidade</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--capitao-text-secondary)]">
          Projetos públicos carregados diretamente do backend do CAPITÃO.
        </p>
      </div>

      <section className="mt-7 space-y-4">
        {projects.length ? projects.map((project) => (
          <article id={project.slug} key={project.slug} className="scroll-mt-6 rounded-[28px] bg-white p-5 shadow-[var(--shadow-card)]">
            <div className="flex gap-4">
              <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--capitao-solar-100)]">
                <Sun className="size-7 text-[#b9850d]" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-extrabold">{project.title}</h2>
                <p className="mt-1 text-sm text-[var(--capitao-text-secondary)]">{project.summary || "Projeto CAPITÃO 2040"}</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--capitao-neutral-100)]">
                  <div className="h-full rounded-full bg-[var(--capitao-primary-700)]" style={{ width: `${Math.max(0, Math.min(100, project.progress))}%` }} />
                </div>
                <p className="mt-2 text-xs font-semibold">{project.progress}% · {project.status}</p>
              </div>
            </div>
          </article>
        )) : (
          <div className="rounded-[28px] bg-white p-6 shadow-[var(--shadow-card)]">
            <p className="font-bold">Backend ainda não disponível neste deploy.</p>
            <p className="mt-2 text-sm text-[var(--capitao-text-secondary)]">Assim que as variáveis do Supabase estiverem configuradas na Cloudflare, os projetos públicos aparecerão aqui.</p>
          </div>
        )}
      </section>
    </main>
  );
}
