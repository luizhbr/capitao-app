"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type ModerationAction = "approve" | "reject" | "unpublish";

const actionLabels: Record<ModerationAction, string> = {
  approve: "Aprovar",
  reject: "Rejeitar",
  unpublish: "Despublicar",
};

const actionStyles: Record<ModerationAction, string> = {
  approve: "bg-emerald-600 text-white",
  reject: "bg-rose-600 text-white",
  unpublish: "bg-[var(--capitao-neutral-100)] text-[var(--capitao-text-secondary)]",
};

export function ModerationActions({ listingId, status }: { listingId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [awaiting, setAwaiting] = useState<ModerationAction | null>(null);

  async function run(action: ModerationAction, withNote: boolean) {
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("moderate_listing", {
      p_listing_id: listingId,
      p_action: action,
      p_note: withNote ? note.trim() || null : action === "reject" ? note.trim() || null : null,
    });
    setBusy(false);
    if (rpcError) {
      setError(
        rpcError.code === "42501"
          ? "Sem permissão para moderar este cadastro."
          : rpcError.message,
      );
      setAwaiting(null);
      setNoteOpen(false);
      return;
    }
    setNote("");
    setAwaiting(null);
    setNoteOpen(false);
    router.refresh();
  }

  function click(action: ModerationAction) {
    if (action === "reject" && !noteOpen) {
      setAwaiting(action);
      setNoteOpen(true);
      return;
    }
    void run(action, action === "reject" || noteOpen);
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        {(["approve", "reject", "unpublish"] as ModerationAction[])
          .filter((a) => !(a === "approve" && status === "published") && !(a === "unpublish" && status !== "published"))
          .map((action) => (
            <button
              key={action}
              disabled={busy}
              onClick={() => click(action)}
              className={`inline-flex min-h-10 items-center rounded-full px-4 text-xs font-bold disabled:opacity-50 ${actionStyles[action]}`}
            >
              {actionLabels[action]}
            </button>
          ))}
      </div>

      {noteOpen ? (
        <div className="mt-3 rounded-2xl bg-[var(--capitao-bg)] p-3">
          <label className="block">
            <span className="mb-1 block text-xs font-bold">Nota de moderação (visível ao proprietário)</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={600}
              rows={3}
              className="w-full rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--capitao-primary-500)]"
              placeholder="Explique o motivo da rejeição ao proprietário…"
            />
          </label>
          <div className="mt-2 flex gap-2">
            <button
              disabled={busy || awaiting === null}
              onClick={() => awaiting && run(awaiting, true)}
              className="inline-flex min-h-10 items-center rounded-full bg-[var(--capitao-primary-900)] px-4 text-xs font-bold text-white disabled:opacity-50"
            >
              Confirmar
            </button>
            <button
              onClick={() => { setNoteOpen(false); setAwaiting(null); }}
              className="inline-flex min-h-10 items-center rounded-full bg-black/[0.05] px-4 text-xs font-bold"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-2 text-xs font-bold text-rose-600">{error}</p> : null}
    </div>
  );
}
