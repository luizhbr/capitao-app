"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient, supabaseEnvConfigured } from "@/lib/supabase/client";
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

const MEDIA_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function EditarCadastroPage() {
  const configured = supabaseEnvConfigured();
  const supabase = useMemo(() => (configured ? createClient() : null), [configured]);
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [state, setState] = useState<"loading" | "notfound" | "ready">("loading");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [mediaBusy, setMediaBusy] = useState<string | null>(null);
  const [media, setMedia] = useState<Array<{ id: string; media_type: string; storage_path: string }>>([]);

  useEffect(() => {
    if (!id || !supabase) return;
    // RLS garante: só o dono vê o próprio registro aqui.
    supabase
      .from("listings")
      .select("id,name,category,description,phone,whatsapp,address,neighborhood,latitude,longitude,status")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          setState("notfound");
          return;
        }
        const form = document.querySelector("form#edit-listing") as HTMLFormElement | null;
        if (form) {
          const set = (name: string, value: string | null) => {
            const el = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
            if (el) el.value = value ?? "";
          };
          set("name", (data as Record<string, string | null>).name);
          set("category", (data as Record<string, string | null>).category);
          set("description", (data as Record<string, string | null>).description);
          set("phone", (data as Record<string, string | null>).phone);
          set("whatsapp", (data as Record<string, string | null>).whatsapp);
          set("address", (data as Record<string, string | null>).address);
          set("neighborhood", (data as Record<string, string | null>).neighborhood);
          const lat = (data as Record<string, number | null>).latitude;
          const lng = (data as Record<string, number | null>).longitude;
          set("latitude", lat === null ? "" : String(lat));
          set("longitude", lng === null ? "" : String(lng));
        }
        setState("ready");
      });
  }, [supabase, id]);

  useEffect(() => {
    if (state !== "ready" || !id || !supabase) return;
    supabase
      .from("listing_media")
      .select("id,media_type,storage_path")
      .eq("listing_id", id)
      .then(({ data }) => setMedia((data ?? []) as never));
  }, [supabase, id, state]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id || !supabase) return;
    setBusy(true);
    setSaved(false);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const latRaw = String(form.get("latitude") ?? "").trim();
    const lngRaw = String(form.get("longitude") ?? "").trim();
    const lat = latRaw === "" ? null : Number(latRaw);
    const lng = lngRaw === "" ? null : Number(lngRaw);

    if ((lat === null) !== (lng === null) || (lat !== null && (Number.isNaN(lat) || Number.isNaN(lng)))) {
      setBusy(false);
      setMessage("Coordenadas inválidas. Use o mapa para definir a localização.");
      return;
    }

    // Campos protegidos (owner_id, status, is_active, created_at) NUNCA vão no payload.
    const payload = {
      name: String(form.get("name") ?? "").trim(),
      category: String(form.get("category") ?? ""),
      description: String(form.get("description") ?? "").trim() || null,
      phone: String(form.get("phone") ?? "").trim() || null,
      whatsapp: String(form.get("whatsapp") ?? "").trim() || null,
      address: String(form.get("address") ?? "").trim() || null,
      neighborhood: String(form.get("neighborhood") ?? "").trim() || null,
      latitude: lat,
      longitude: lng,
    };

    const { error } = await supabase.from("listings").update(payload).eq("id", id);
    setBusy(false);
    if (error) {
      setMessage(error.code === "42501" ? "Você só pode editar seus próprios cadastros." : error.message);
      return;
    }
    setSaved(true);
    setMessage("Alterações salvas.");
  }

  async function uploadMedia(kind: "logo" | "cover", file: File | null) {
    if (!id || !supabase || !file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setMessage("Formato inválido. Use JPEG, PNG ou WebP.");
      return;
    }
    if (file.size > MEDIA_MAX_BYTES) {
      setMessage("Imagem muito grande. Limite de 5 MB.");
      return;
    }
    setMediaBusy(kind);
    setMessage("");
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) {
      setMediaBusy(null);
      setMessage("Sessão expirada.");
      return;
    }
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${uid}/${id}/${kind}/current.${ext}`;
    const { error: upError } = await supabase.storage
      .from("listing-media")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (upError) {
      setMediaBusy(null);
      setMessage(upError.message);
      return;
    }

    const { error: dbError } = await supabase
      .from("listing_media")
      .upsert(
        { listing_id: id, owner_id: uid, storage_path: path, media_type: kind, position: 0 },
        { onConflict: "listing_id,storage_path" },
      );
    setMediaBusy(null);
    if (dbError) {
      setMessage(dbError.message);
      return;
    }
    setMessage(kind === "logo" ? "Logo atualizado." : "Capa atualizada.");
  }

  if (state === "loading") {
    return (
      <main className="mx-auto min-h-svh max-w-md px-5 py-8">
        <p className="text-sm text-[var(--capitao-text-secondary)]">Carregando…</p>
      </main>
    );
  }
  if (state === "notfound") {
    return (
      <main className="mx-auto min-h-svh max-w-md px-5 py-8">
        <div className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)]">
          <h1 className="text-2xl font-extrabold">Cadastro não encontrado</h1>
          <p className="mt-2 text-sm text-[var(--capitao-text-secondary)]">Este cadastro não existe ou não é seu.</p>
          <Link href="/perfil/cadastros" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[var(--capitao-primary-900)] px-5 text-sm font-bold text-white">
            Voltar
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-svh max-w-md px-5 py-8">
      <Link href="/perfil/cadastros" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--capitao-primary-700)]">
        <ArrowLeft className="size-4" /> Meus cadastros
      </Link>

      <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Editar cadastro</h1>

      <form id="edit-listing" onSubmit={save} className="mt-5 space-y-4 rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-card)]">
        <label className="block">
          <span className="mb-1 block text-xs font-bold">Nome *</span>
          <input required minLength={2} maxLength={120} name="name" className="min-h-12 w-full rounded-2xl border border-black/10 bg-[var(--capitao-bg)] px-4 text-sm outline-none focus:border-[var(--capitao-primary-500)]" />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-bold">Categoria *</span>
          <select required name="category" className="min-h-12 w-full rounded-2xl border border-black/10 bg-[var(--capitao-bg)] px-4 text-sm outline-none focus:border-[var(--capitao-primary-500)]">
            {categories.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-bold">Descrição</span>
          <textarea name="description" maxLength={1000} rows={3} className="w-full rounded-2xl border border-black/10 bg-[var(--capitao-bg)] px-4 py-3 text-sm outline-none focus:border-[var(--capitao-primary-500)]" />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-bold">Telefone</span>
            <input name="phone" maxLength={30} className="min-h-12 w-full rounded-2xl border border-black/10 bg-[var(--capitao-bg)] px-4 text-sm outline-none focus:border-[var(--capitao-primary-500)]" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold">WhatsApp</span>
            <input name="whatsapp" maxLength={30} className="min-h-12 w-full rounded-2xl border border-black/10 bg-[var(--capitao-bg)] px-4 text-sm outline-none focus:border-[var(--capitao-primary-500)]" />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-bold">Endereço</span>
          <input name="address" maxLength={200} className="min-h-12 w-full rounded-2xl border border-black/10 bg-[var(--capitao-bg)] px-4 text-sm outline-none focus:border-[var(--capitao-primary-500)]" />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-bold">Bairro</span>
          <input name="neighborhood" maxLength={100} className="min-h-12 w-full rounded-2xl border border-black/10 bg-[var(--capitao-bg)] px-4 text-sm outline-none focus:border-[var(--capitao-primary-500)]" />
        </label>

        <input type="hidden" name="latitude" readOnly />
        <input type="hidden" name="longitude" readOnly />

        <div className="rounded-2xl bg-[var(--capitao-bg)] p-4">
          <p className="text-xs font-bold">Localização</p>
          <p className="mt-1 text-xs text-[var(--capitao-text-secondary)]">
            Defina o ponto do negócio no mapa de Capitão Andrade/MG.
          </p>
          <div id="edit-map" className="mt-3 h-56 w-full overflow-hidden rounded-2xl border border-black/10" />
          <button
            type="button"
            data-map-clear
            className="mt-2 inline-flex min-h-9 items-center rounded-full bg-black/[0.05] px-3 text-xs font-bold"
          >
            Remover localização
          </button>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--capitao-primary-900)] text-sm font-bold text-white disabled:opacity-50"
        >
          {busy ? "Salvando…" : "Salvar alterações"}
        </button>

        {saved ? <p className="text-center text-xs font-bold text-emerald-600">{message}</p> : null}
        {!saved && message ? <p className="text-center text-xs font-bold text-rose-600">{message}</p> : null}
      </form>

      <div className="mt-5 space-y-3 rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-card)]">
        <p className="text-xs font-bold">Logo</p>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => uploadMedia("logo", e.target.files?.[0] ?? null)}
          disabled={mediaBusy !== null}
          className="block w-full text-xs"
        />
        <p className="mt-2 text-xs font-bold">Foto de capa</p>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => uploadMedia("cover", e.target.files?.[0] ?? null)}
          disabled={mediaBusy !== null}
          className="block w-full text-xs"
        />
        {mediaBusy ? <p className="text-xs text-[var(--capitao-text-secondary)]">Enviando {mediaBusy}…</p> : null}
        {media.length > 0 ? (
          <p className="mt-2 text-[10px] text-[var(--capitao-text-secondary)]">
            {media.length} arquivo(s) de mídia vinculado(s).
          </p>
        ) : null}
        {message && !saved && !mediaBusy ? <p className="text-xs font-bold text-rose-600">{message}</p> : null}
      </div>

      <MapPicker containerId="edit-map" formSelector="form#edit-listing" />
      <MapClearButton formSelector="form#edit-listing" />
    </main>
  );
}
