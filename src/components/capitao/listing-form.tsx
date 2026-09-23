"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const categories = [
  ["commerce", "Comércio"],
  ["food", "Comida"],
  ["services", "Serviços"],
  ["tourism", "Turismo"],
  ["producer", "Feito em Capitão"],
  ["tech", "Tecnologia"],
] as const;

export function ListingForm() {
  const supabase = useMemo(() => createClient(), []);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAuthenticated(Boolean(data.user)));
  }, [supabase]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setSuccess(false);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? "").trim(),
      category: String(form.get("category") ?? ""),
      description: String(form.get("description") ?? "").trim() || null,
      phone: String(form.get("phone") ?? "").trim() || null,
      whatsapp: String(form.get("whatsapp") ?? "").trim() || null,
      address: String(form.get("address") ?? "").trim() || null,
      neighborhood: String(form.get("neighborhood") ?? "").trim() || null,
    };

    const { error } = await supabase.from("listings").insert(payload);
    setBusy(false);

    if (error) {
      if (error.code === "42501") {
        setMessage("Sua sessão não permite este cadastro. Entre novamente e tente de novo.");
      } else {
        setMessage(error.message);
      }
      return;
    }

    event.currentTarget.reset();
    setSuccess(true);
    setMessage("Cadastro enviado. Ele aparece em Meus cadastros e ficará público após aprovação.");
  }

  if (authenticated === null) {
    return <div className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)]">Verificando sua sessão…</div>;
  }

  if (!authenticated) {
    return (
      <div className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)]">
        <LogIn className="size-7 text-[var(--capitao-primary-700)]" />
        <h2 className="mt-4 text-xl font-extrabold">Entre para cadastrar</h2>
        <p className="mt-2 text-sm leading-5 text-[var(--capitao-text-secondary)]">O cadastro fica vinculado à sua conta e passa por aprovação antes de aparecer publicamente.</p>
        <Link href="/perfil" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[var(--capitao-primary-900)] px-5 text-sm font-bold text-white">Ir para login</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-card)]">
      <label className="block">
        <span className="mb-1 block text-xs font-bold">Nome *</span>
        <input required minLength={2} maxLength={120} name="name" className="min-h-12 w-full rounded-2xl border border-black/10 bg-[var(--capitao-bg)] px-4 text-sm outline-none focus:border-[var(--capitao-primary-500)]" placeholder="Nome do negócio, serviço ou iniciativa" />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-bold">Categoria *</span>
        <select required name="category" defaultValue="commerce" className="min-h-12 w-full rounded-2xl border border-black/10 bg-[var(--capitao-bg)] px-4 text-sm outline-none focus:border-[var(--capitao-primary-500)]">
          {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-bold">Descrição</span>
        <textarea maxLength={1000} name="description" rows={4} className="w-full rounded-2xl border border-black/10 bg-[var(--capitao-bg)] px-4 py-3 text-sm outline-none focus:border-[var(--capitao-primary-500)]" placeholder="Conte em poucas linhas o que você oferece." />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-bold">Telefone</span>
          <input maxLength={30} name="phone" inputMode="tel" className="min-h-12 w-full rounded-2xl border border-black/10 bg-[var(--capitao-bg)] px-4 text-sm outline-none" placeholder="(33) ..." />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold">WhatsApp</span>
          <input maxLength={30} name="whatsapp" inputMode="tel" className="min-h-12 w-full rounded-2xl border border-black/10 bg-[var(--capitao-bg)] px-4 text-sm outline-none" placeholder="5533..." />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-bold">Endereço</span>
        <input maxLength={200} name="address" className="min-h-12 w-full rounded-2xl border border-black/10 bg-[var(--capitao-bg)] px-4 text-sm outline-none" placeholder="Rua, número" />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-bold">Bairro / comunidade</span>
        <input maxLength={100} name="neighborhood" className="min-h-12 w-full rounded-2xl border border-black/10 bg-[var(--capitao-bg)] px-4 text-sm outline-none" />
      </label>

      <button disabled={busy} className="min-h-12 w-full rounded-full bg-[var(--capitao-primary-900)] px-5 text-sm font-bold text-white disabled:opacity-50">
        {busy ? "Enviando…" : "Enviar para aprovação"}
      </button>

      {message ? (
        <p className={`flex items-start gap-2 rounded-2xl p-3 text-xs ${success ? "bg-[var(--capitao-primary-100)] text-[var(--capitao-primary-900)]" : "bg-[var(--capitao-neutral-100)]"}`}>
          {success ? <CheckCircle2 className="size-4 shrink-0" /> : null}
          <span>{message}</span>
        </p>
      ) : null}
    </form>
  );
}
