import Link from "next/link";
import { ArrowRight, Sun } from "lucide-react";

export type PublicProject = {
  slug: string;
  title: string;
  summary: string | null;
  status: string;
  progress: number;
};

const statusLabel: Record<string, string> = {
  idea: "Ideia",
  research: "Pesquisa",
  viability: "Estudo de viabilidade",
  project: "Projeto",
  funding: "Captação",
  execution: "Execução",
  done: "Concluído",
};

export function ProjectCard({
  project = {
    slug: "energia-solar-cooperativa",
    title: "Energia Solar Cooperativa",
    summary: "Projeto piloto",
    status: "viability",
    progress: 42,
  },
}: {
  project?: PublicProject;
}) {
  const progress = Math.max(0, Math.min(100, Number(project.progress) || 0));

  return (
    <article className="rounded-[var(--radius-featured)] bg-[var(--capitao-solar-100)] p-5 shadow-[var(--shadow-featured)]">
      <div className="flex items-start gap-4">
        <div className="grid size-16 shrink-0 place-items-center rounded-[22px] bg-white/75 shadow-sm">
          <Sun className="size-8 text-[#b9850d]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-bold">{project.title}</p>
              <p className="mt-1 line-clamp-2 text-xs text-[var(--capitao-text-secondary)]">
                {project.summary || "Projeto Capitão 2040"}
              </p>
            </div>
            <Link
              href={`/capitao-2040#${project.slug}`}
              className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--capitao-primary-700)] text-white"
              aria-label={`Abrir projeto ${project.title}`}
            >
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/80">
            <div
              className="h-full rounded-full bg-[var(--capitao-primary-700)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 text-xs font-medium">
            <span>{statusLabel[project.status] ?? project.status}</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    </article>
  );
}
