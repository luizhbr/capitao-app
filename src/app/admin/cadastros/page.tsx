import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ModerationActions } from "@/components/capitao/moderation-actions";

export const dynamic = "force-dynamic";

const filters = [
  ["todos", "Todos"],
  ["pending", "Pendentes"],
  ["published", "Publicados"],
  ["rejected", "Rejeitados"],
] as const;

const statusLabels: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pendente", cls: "bg-amber-100 text-amber-800" },
  published: { label: "Publicado", cls: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Rejeitado", cls: "bg-rose-100 text-rose-800" },
};

const categoryLabels: Record<string, string> = {
  commerce: "Comércio",
  food: "Comida",
  services: "Serviços",
  tourism: "Turismo",
  producer: "Feito em Capitão",
  tech: "Tecnologia",
};

type AdminListing = {
  id: string;
  owner_id: string;
  name: string;
  category: string;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  neighborhood: string | null;
  status: string;
  created_at: string;
  moderation_note: string | null;
};

async function getListings(status: string): Promise<AdminListing[]> {
  try {
    const supabase = await createClient();
    const rpc = await supabase.rpc("admin_list_listings", {
      p_status: status === "todos" ? null : status,
    });
    if (!rpc.error && rpc.data) return rpc.data as unknown as AdminListing[];
    let q = supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (status !== "todos") q = q.eq("status", status);
    const { data } = await q;
    return (data ?? []) as unknown as AdminListing[];
  } catch {
    return [];
  }
}

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = filters.some(([s]) => s === params.status)
    ? (params.status as string)
    : "todos";
  const listings = await getListings(status);

  return (
    <div>
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--capitao-primary-500)]">
          Painel CAPITÃO
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Cadastros</h1>
      </header>

      <nav className="mt-5 flex flex-wrap gap-2" aria-label="Filtro de status">
        {filters.map(([value, label]) => (
          <Link
            key={value}
            href={value === "todos" ? "/admin/cadastros" : `/admin/cadastros?status=${value}`}
            className={`inline-flex min-h-10 items-center rounded-full px-4 text-xs font-bold ${
              status === value
                ? "bg-[var(--capitao-primary-900)] text-white"
                : "bg-[var(--capitao-neutral-100)] text-[var(--capitao-text-secondary)]"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {listings.length === 0 ? (
        <div className="mt-6 rounded-[var(--radius-card)] bg-white p-6 text-center shadow-[var(--shadow-card)]">
          <p className="text-sm text-[var(--capitao-text-secondary)]">
            Nenhum cadastro neste filtro.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {listings.map((l) => {
            const badge = statusLabels[l.status] ?? { label: l.status, cls: "bg-black/5" };
            return (
              <article
                key={l.id}
                className="rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-card)]"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${badge.cls}`}
                  >
                    {badge.label}
                  </span>
                  <span className="rounded-full bg-[var(--capitao-neutral-100)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--capitao-text-secondary)]">
                    {categoryLabels[l.category] ?? l.category}
                  </span>
                  <span className="text-xs text-[var(--capitao-text-secondary)]">
                    {new Date(l.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <h2 className="mt-3 text-lg font-extrabold leading-tight">{l.name}</h2>
                {l.description ? (
                  <p className="mt-1 text-sm leading-5 text-[var(--capitao-text-secondary)]">
                    {l.description}
                  </p>
                ) : null}

                <dl className="mt-3 grid grid-cols-1 gap-1 text-xs text-[var(--capitao-text-secondary)] sm:grid-cols-2">
                  {l.address ? (
                    <div>
                      <dt className="inline font-bold">Endereço: </dt>
                      <dd className="inline">{l.address}</dd>
                    </div>
                  ) : null}
                  {l.neighborhood ? (
                    <div>
                      <dt className="inline font-bold">Bairro: </dt>
                      <dd className="inline">{l.neighborhood}</dd>
                    </div>
                  ) : null}
                  {l.phone ? (
                    <div>
                      <dt className="inline font-bold">Telefone: </dt>
                      <dd className="inline">{l.phone}</dd>
                    </div>
                  ) : null}
                  {l.whatsapp ? (
                    <div>
                      <dt className="inline font-bold">WhatsApp: </dt>
                      <dd className="inline">{l.whatsapp}</dd>
                    </div>
                  ) : null}
                </dl>

                <p className="mt-3 text-[10px] text-[var(--capitao-text-secondary)]">
                  Proprietário: <span className="font-mono">{l.owner_id.slice(0, 8)}…</span>
                </p>

                {l.moderation_note ? (
                  <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    <span className="font-bold">Nota anterior:</span> {l.moderation_note}
                  </p>
                ) : null}

                <ModerationActions listingId={l.id} status={l.status} />
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
