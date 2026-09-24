"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, LogIn } from "lucide-react";
import { createClient, supabaseEnvConfigured } from "@/lib/supabase/client";
import { AddressGeocoder } from "@/components/capitao/address-geocoder";
import { MapPicker } from "@/components/capitao/map-picker";
import { MapClearButton } from "@/components/capitao/map-clear-button";

const categories = [
  ["commerce", "Comércio"],
  ["food", "Comida"],
  ["services", "Serviços"],
  ["tourism", "Turismo"],
  ["producer", "Feito em Capitão"],
  ["tech", "Tecnologia"],
] as const;

export function ListingForm() {
  const configured = supabaseEnvConfigured();
  const supabase = useMemo(() => (configured ? createClient() : null), [configured]);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setAuthenticated(Boolean(data.user)));
  }, [supabase]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;

    setBusy(true);
    setSuccess(false);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const latRaw = String(form.get("latitude") ?? "").trim();
    const lngRaw = String(form.get("longitude") ?? "").trim();
    const latitude = latRaw === "" ? null : Number(latRaw);
    const longitude = lngRaw === "" ? null : Number(lngRaw);

    if (
      (latitude === null) !== (longitude === null) ||
      (latitude !== null && (!Number.isFinite(latitude) || !Number.isFinite(longitude)))
    ) {
      setBusy(false);
      setMessage("Localização inválida. Use o mapa para definir o ponto.");
      return;
    }

    const geocodingStatus = String(form.get("geocoding_status") ?? "").trim() || null;
    const geocodingSource = String(form.get("geocoding_source") ?? "").trim() || null;
    const geocodedAt = String(form.get("geocoded_at") ?? "").trim() || null;

    const payload = {
      name: String(form.get("name") ?? "").trim(),
      category: String(form.get("category") ?? ""),
      description: String(form.get("description") ?? "").trim() || null,
      phone: String(form.get("phone") ?? "").trim() || null,
      whatsapp: String(form.get("whatsapp") ?? "").trim() || null,
      address: String(form.get("address") ?? "").trim() || null,
      neighborhood: String(form.get("neighborhood") ?? "").trim() || null,
      latitude,
      longitude,
      geocoding_status: latitude === null ? null : (geocodingStatus ?? "manual"),
      geocoding_source: latitude === null ? null : (geocodingSource ?? "manual"),
      geocoded_at: latitude === null ? null : (geocodedAt ?? new Date().toISOString()),
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
    window.dispatchEvent(new CustomEvent("capitao-map:clear-location", {
      detail: { containerId: "create-map" },
    }));
    setSuccess(true);
    setMessage("Cadastro enviado. Ele aparece em Meus cadastros e ficará público após aprovação.");
  }

  if (!configured) {
    return (
      <div className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-xl font-extrabold">Cadastro indisponível</h2>
        <p className="mt-2 text-sm leading-5 text-[var(--capitao-text-secondary)]">
          O diretório ainda não está conectado ao banco de dados neste ambiente.
        </p>
      </div>
    );
  }

  if (authenticated === null) {
    return <div className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)]">Verificando sua sessão…</div>;
  }

  if (!authenticated) {
    return (
      <div className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)]">
        <LogIn className="size-7 text-[var(--capitao-primary-700)]" />
        <h2 className="mt-4 text-xl font-extrabold">Entre para cadastrar</h2>
        <p className="mt-2 text-sm leading-5 text-[var(--capitao-text-secondary)]">
          O cadastro fica vinculado à sua conta e passa por aprovação antes de aparecer publicamente.
        </p>
        <Link href="/perfil" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[var(--capitao-primary-900)] px-5 text-sm font-bold text-white">
          Ir para login
        </Link>
      </div>
    );
  }

  return (
    <>
      <form id="create-listing" onSubmit={submit} className="space-y-4 rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-card)]">
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

        <input type="hidden" name="latitude" readOnly />
        <input type="hidden" name="longitude" readOnly />
        <input type="hidden" name="geocoding_status" readOnly />
        <input type="hidden" name="geocoding_source" readOnly />
        <input type="hidden" name="geocoded_at" readOnly />

        <div className="rounded-[var(--radius-card)] bg-[var(--capitao-primary-050)] p-4">
          <p className="text-sm font-extrabold">Localização no mapa</p>
          <p className="mt-1 text-xs leading-5 text-[var(--capitao-text-secondary)]">
            Localize pelo endereço ou toque no mapa. Você pode arrastar o marcador para corrigir o ponto.
          </p>

          <div className="mt-3">
            <AddressGeocoder formSelector="form#create-listing" mapContainerId="create-map" />
          </div>

          <div id="create-map" className="mt-3 h-64 w-full overflow-hidden rounded-2xl border border-black/10 bg-white" />

          <button type="button" data-map-clear className="mt-2 inline-flex min-h-9 items-center rounded-full bg-black/[0.05] px-3 text-xs font-bold">
            Remover localização
          </button>
        </div>

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

      <MapPicker containerId="create-map" formSelector="form#create-listing" />
      <MapClearButton formSelector="form#create-listing" containerId="create-map" />
    </>
  );
}
