"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { createClient, supabaseEnvConfigured } from "@/lib/supabase/client";
import { MapPicker } from "@/components/capitao/map-picker";
import { MapClearButton } from "@/components/capitao/map-clear-button";
import { AddressGeocoder } from "@/components/capitao/address-geocoder";

const categories = [
  ["commerce", "Comércio"],
  ["food", "Comida"],
  ["services", "Serviços"],
  ["tourism", "Turismo"],
  ["producer", "Feito em Capitão"],
  ["tech", "Tecnologia"],
] as const;

const MEDIA_MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_GALLERY_ITEMS = 12;

type MediaRow = {
  id: string;
  media_type: "logo" | "cover" | "gallery";
  storage_path: string;
};

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
  const [media, setMedia] = useState<MediaRow[]>([]);
  const [initialLat, setInitialLat] = useState<number | null>(null);
  const [initialLng, setInitialLng] = useState<number | null>(null);

  useEffect(() => {
    if (!id || !supabase) return;

    supabase
      .from("listings")
      .select("id,name,category,description,phone,whatsapp,address,neighborhood,latitude,longitude,geocoding_status,geocoding_source,geocoded_at,status")
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
          set("geocoding_status", (data as Record<string, string | null>).geocoding_status);
          set("geocoding_source", (data as Record<string, string | null>).geocoding_source);
          set("geocoded_at", (data as Record<string, string | null>).geocoded_at);
          setInitialLat(lat);
          setInitialLng(lng);
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
      .order("created_at", { ascending: true })
      .then(({ data }) => setMedia((data ?? []) as MediaRow[]));
  }, [supabase, id, state]);

  async function refreshMedia() {
    if (!id || !supabase) return;
    const { data } = await supabase
      .from("listing_media")
      .select("id,media_type,storage_path")
      .eq("listing_id", id)
      .order("created_at", { ascending: true });

    setMedia((data ?? []) as MediaRow[]);
  }

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
      latitude: lat,
      longitude: lng,
      geocoding_status: lat === null ? null : (geocodingStatus ?? "manual"),
      geocoding_source: lat === null ? null : (geocodingSource ?? "manual"),
      geocoded_at: lat === null ? null : (geocodedAt ?? new Date().toISOString()),
    };

    const { error } = await supabase.from("listings").update(payload).eq("id", id);
    setBusy(false);

    if (error) {
      setMessage(error.code === "42501" ? "Você só pode editar seus próprios cadastros." : error.message);
      return;
    }

    setSaved(true);
    setMessage("Alterações salvas. Se o cadastro estava publicado, ele volta para análise.");
  }

  async function uploadMedia(kind: "logo" | "cover" | "gallery", file: File | null) {
    if (!id || !supabase || !file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setMessage("Formato inválido. Use JPEG, PNG ou WebP.");
      return;
    }

    if (file.size > MEDIA_MAX_BYTES) {
      setMessage("Imagem muito grande. Limite de 5 MB.");
      return;
    }

    if (kind === "gallery" && media.filter((item) => item.media_type === "gallery").length >= MAX_GALLERY_ITEMS) {
      setMessage(`A galeria aceita no máximo ${MAX_GALLERY_ITEMS} imagens.`);
      return;
    }

    setMediaBusy(kind);
    setSaved(false);
    setMessage("");

    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;

    if (!uid) {
      setMediaBusy(null);
      setMessage("Sessão expirada.");
      return;
    }

    if (kind !== "gallery") {
      const existing = media.filter((item) => item.media_type === kind);

      if (existing.length) {
        const { error: storageDeleteError } = await supabase.storage
          .from("listing-media")
          .remove(existing.map((item) => item.storage_path));

        if (storageDeleteError) {
          setMediaBusy(null);
          setMessage(storageDeleteError.message);
          return;
        }

        const { error: dbDeleteError } = await supabase
          .from("listing_media")
          .delete()
          .in("id", existing.map((item) => item.id));

        if (dbDeleteError) {
          setMediaBusy(null);
          setMessage(dbDeleteError.message);
          return;
        }
      }
    }

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const filename = `${crypto.randomUUID()}.${ext}`;
    const storagePath = `${uid}/${id}/${kind}/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from("listing-media")
      .upload(storagePath, file, {
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      setMediaBusy(null);
      setMessage(uploadError.message);
      return;
    }

    const { error: dbError } = await supabase
      .from("listing_media")
      .insert({
        listing_id: id,
        owner_id: uid,
        storage_path: storagePath,
        media_type: kind,
        position: 0,
      });

    if (dbError) {
      await supabase.storage.from("listing-media").remove([storagePath]);
      setMediaBusy(null);
      setMessage(dbError.message);
      return;
    }

    await refreshMedia();
    setMediaBusy(null);
    setMessage(
      kind === "logo"
        ? "Logo atualizado e enviado para análise."
        : kind === "cover"
          ? "Capa atualizada e enviada para análise."
          : "Foto adicionada à galeria e enviada para análise.",
    );
  }

  async function removeMedia(item: MediaRow) {
    if (!supabase) return;

    setMediaBusy("remover");
    setSaved(false);
    setMessage("");

    const { error: storageError } = await supabase.storage
      .from("listing-media")
      .remove([item.storage_path]);

    if (storageError) {
      setMediaBusy(null);
      setMessage(storageError.message);
      return;
    }

    const { error: dbError } = await supabase
      .from("listing_media")
      .delete()
      .eq("id", item.id);

    if (dbError) {
      setMediaBusy(null);
      setMessage(dbError.message);
      return;
    }

    await refreshMedia();
    setMediaBusy(null);
    setMessage("Imagem removida. O cadastro voltou para análise se estava publicado.");
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

  const galleryCount = media.filter((item) => item.media_type === "gallery").length;

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
        <input type="hidden" name="geocoding_status" readOnly />
        <input type="hidden" name="geocoding_source" readOnly />
        <input type="hidden" name="geocoded_at" readOnly />

        <div className="rounded-2xl bg-[var(--capitao-primary-050)] p-4">
          <p className="text-sm font-extrabold">Localização</p>
          <p className="mt-1 text-xs leading-5 text-[var(--capitao-text-secondary)]">
            Localize pelo endereço ou ajuste diretamente no mapa de Capitão Andrade/MG.
          </p>
          <div className="mt-3">
            <AddressGeocoder formSelector="form#edit-listing" mapContainerId="edit-map" />
          </div>
          <div id="edit-map" className="mt-3 h-64 w-full overflow-hidden rounded-2xl border border-black/10 bg-white" />
          <button type="button" data-map-clear className="mt-2 inline-flex min-h-9 items-center rounded-full bg-black/[0.05] px-3 text-xs font-bold">
            Remover localização
          </button>
        </div>

        <button type="submit" disabled={busy} className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--capitao-primary-900)] text-sm font-bold text-white disabled:opacity-50">
          {busy ? "Salvando…" : "Salvar alterações"}
        </button>

        {saved ? <p className="text-center text-xs font-bold text-emerald-600">{message}</p> : null}
      </form>

      <div className="mt-5 space-y-4 rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-card)]">
        <div>
          <p className="text-xs font-bold">Logo</p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => void uploadMedia("logo", e.target.files?.[0] ?? null)}
            disabled={mediaBusy !== null}
            className="mt-2 block w-full text-xs"
          />
        </div>

        <div>
          <p className="text-xs font-bold">Foto de capa</p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => void uploadMedia("cover", e.target.files?.[0] ?? null)}
            disabled={mediaBusy !== null}
            className="mt-2 block w-full text-xs"
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold">Galeria</p>
            <span className="text-[10px] font-semibold text-[var(--capitao-text-secondary)]">{galleryCount}/{MAX_GALLERY_ITEMS}</span>
          </div>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const input = e.currentTarget;
              const remaining = Math.max(0, MAX_GALLERY_ITEMS - galleryCount);
              const files = Array.from(input.files ?? []).slice(0, remaining);
              void (async () => {
                for (const file of files) {
                  await uploadMedia("gallery", file);
                }
                input.value = "";
              })();
            }}
            disabled={mediaBusy !== null || galleryCount >= MAX_GALLERY_ITEMS}
            className="mt-2 block w-full text-xs"
          />
        </div>

        {media.length ? (
          <div className="space-y-2 border-t border-black/[0.06] pt-4">
            {media.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--capitao-bg)] p-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold">
                    {item.media_type === "logo" ? "Logo" : item.media_type === "cover" ? "Capa" : "Galeria"}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-[var(--capitao-text-secondary)]">{item.storage_path.split("/").at(-1)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void removeMedia(item)}
                  disabled={mediaBusy !== null}
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-red-50 text-red-700 disabled:opacity-40"
                  aria-label="Remover imagem"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {mediaBusy ? <p className="text-xs text-[var(--capitao-text-secondary)]">Processando mídia…</p> : null}
        {message && !saved && !mediaBusy ? <p className="text-xs font-bold text-[var(--capitao-text-secondary)]">{message}</p> : null}
      </div>

      <MapPicker
        containerId="edit-map"
        formSelector="form#edit-listing"
        initialLat={initialLat}
        initialLng={initialLng}
      />
      <MapClearButton formSelector="form#edit-listing" containerId="edit-map" />
    </main>
  );
}
