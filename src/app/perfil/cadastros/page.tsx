"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LogIn, Plus } from "lucide-react";
import { createClient, supabaseEnvConfigured } from "@/lib/supabase/client";

const statusLabels: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pendente", cls: "bg-amber-100 text-amber-800" },
  published: { label: "Publicado", cls: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Rejeitado", cls: "bg-rose-100 text-rose-800" },
};

type OwnListing = {
  id: string;
  name: string;
  category: string;
  status: string;
  moderation_note: string | null;
};

export default function MeusCadastrosPage() {
  const configured = supabaseEnvConfigured();
  const supabase = useMemo(() => (configured ? createClient() : null), [configured]);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [listings, setListings] = useState<OwnListing[]>([]);

  useEffect(() => {
    if (!supabase) {
      setAuthed(false);
      return;
    }
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setAuthed(false);
        return;
      }
      setAuthed(true);
      const { data: rows } = await supabase
        .from("listings")
        .select("id,name,category,status,moderation_note")
        .order("created_at", { ascending: false });
      setListings((rows ?? []) as unknown as OwnListing[]);
    });
  }, [supabase]);

  if (authed === null) {
    return (
      <main className="mx-auto min-h-svh max-w-md px-5 py-8">
        <p className="text-sm text-[var(--capitao-text-secondary)]">Carregando…</p>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="mx-auto min-h-svh max-w-md px-5 py-8">
        <Link href="/perfil" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--capitao-primary-700)]">
          <ArrowLeft className="size-4" /> Perfil
        </Link>
        <div className="mt-6 rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)]">
          <LogIn className="size-7 text-[var(--capitao-primary-700)]" />
          <h1 className="mt-4 text-2xl font-extrabold">Entre para ver seus cadastros</h1>
          <Link href="/perfil" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[var(--capitao-primary-900)] px-5 text-sm font-bold text-white">
            Ir para login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-svh max-w-md px-5 py-8">
      <Link href="/perfil" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--capitao-primary-700)]">
        <ArrowLeft className="size-4" /> Perfil
      </Link>

      <header className="mt-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Meus cadastros</h1>
        <Link
          href="/explorar/cadastrar"
          className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--capitao-primary-900)] px-4 text-xs font-bold text-white"
        >
          <Plus className="size-4" /> Novo
        </Link>
      </header>

      {listings.length === 0 ? (
        <div className="mt-6 rounded-[var(--radius-card)] bg-white p-6 text-center shadow-[var(--shadow-card)]">
          <p className="text-sm text-[var(--capitao-text-secondary)]">
            Você ainda não cadastrou nenhum negócio.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {listings.map((l) => {
            const badge = statusLabels[l.status] ?? { label: l.status, cls: "bg-black/5" };
            return (
              <article key={l.id} className="rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="min-w-0 flex-1 truncate font-extrabold">{l.name}</h2>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>
                {l.moderation_note ? (
                  <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    <span className="font-bold">Nota do moderador:</span> {l.moderation_note}
                  </p>
                ) : null}
                <Link
                  href={`/perfil/cadastros/${l.id}/editar`}
                  className="mt-3 inline-flex min-h-10 items-center rounded-full bg-[var(--capitao-primary-100)] px-4 text-xs font-bold text-[var(--capitao-primary-900)]"
                >
                  Editar
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
