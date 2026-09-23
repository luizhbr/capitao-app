import Link from "next/link";
import { Clock, Eye, ListChecks, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/security/public-config";

export const dynamic = "force-dynamic";

type Counts = { pending: number; published: number; rejected: number };

async function getCounts(): Promise<Counts> {
  if (!supabaseConfigured()) return { pending: 0, published: 0, rejected: 0 };
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("listings")
      .select("status");
    if (error) return { pending: 0, published: 0, rejected: 0 };
    const rows = (data ?? []) as Array<{ status: string }>;
    // Nota: com RLS ativo o usuário comum só vê publicados + próprios; o painel
    // de visão geral usa contagens seguras via RPC quando disponível.
    return {
      pending: rows.filter((r) => r.status === "pending").length,
      published: rows.filter((r) => r.status === "published").length,
      rejected: rows.filter((r) => r.status === "rejected").length,
    };
  } catch {
    return { pending: 0, published: 0, rejected: 0 };
  }
}

export default async function AdminOverviewPage() {
  const counts = await getCounts();

  const cards = [
    { label: "Pendentes", value: counts.pending, icon: Clock, tone: "bg-amber-50 text-amber-700" },
    { value: counts.published, label: "Publicados", icon: Eye, tone: "bg-emerald-50 text-emerald-700" },
    { value: counts.rejected, label: "Rejeitados", icon: XCircle, tone: "bg-rose-50 text-rose-700" },
  ] as const;

  return (
    <div>
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--capitao-primary-500)]">Painel CAPITÃO</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Visão geral</h1>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-card)]">
            <div className={`grid size-10 place-items-center rounded-2xl ${tone}`}>
              <Icon className="size-5" />
            </div>
            <p className="mt-4 text-3xl font-extrabold">{value}</p>
            <p className="text-sm font-bold text-[var(--capitao-text-secondary)]">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2">
          <ListChecks className="size-5 text-[var(--capitao-primary-700)]" />
          <h2 className="text-lg font-extrabold">Moderação</h2>
        </div>
        <p className="mt-1 text-sm text-[var(--capitao-text-secondary)]">
          Analise cadastros pendentes, aprove ou rejeite com nota ao proprietário.
        </p>
        <Link
          href="/admin/cadastros"
          className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[var(--capitao-primary-900)] px-5 text-sm font-bold text-white"
        >
          Ir para moderação
        </Link>
      </div>
    </div>
  );
}
