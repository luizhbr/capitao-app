import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, MapPin, MessageCircle, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/security/public-config";
import { PublicListingMap } from "@/components/capitao/public-listing-map";

export const dynamic = "force-dynamic";

const categoryLabels: Record<string, string> = {
  commerce: "Comércio",
  food: "Comida",
  services: "Serviços",
  tourism: "Turismo",
  producer: "Feito em Capitão",
  tech: "Tecnologia",
};

type FullListing = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  is_active: boolean;
};

async function getListing(id: string): Promise<FullListing | null> {
  if (!supabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("listings")
      .select("id,name,category,description,phone,whatsapp,address,neighborhood,latitude,longitude,status,is_active")
      .eq("id", id)
      .maybeSingle();
    if (!data) return null;
    const l = data as unknown as FullListing;
    // pending/rejected nunca são públicos (RLS já filtra para anônimos; reforço aqui)
    if (l.status !== "published" || !l.is_active) return null;
    return l;
  } catch {
    return null;
  }
}

export default async function PublicListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const whatsapp = listing.whatsapp ? listing.whatsapp.replace(/\D/g, "") : "";

  return (
    <main className="mx-auto min-h-svh max-w-md px-4 pb-32 pt-6 sm:px-5">
      <Link href="/explorar" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--capitao-primary-700)]">
        <ArrowLeft className="size-4" /> Explorar
      </Link>

      {listing.latitude && listing.longitude ? (
        <div className="mt-5 overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-card)]">
          <div id="public-map" className="h-56 w-full" />
        </div>
      ) : null}

      <article className="mt-5 rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-start gap-4">
          <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[var(--capitao-primary-100)]">
            <Building2 className="size-8 text-[var(--capitao-primary-900)]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="rounded-full bg-[var(--capitao-neutral-100)] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--capitao-text-secondary)]">
              {categoryLabels[listing.category] ?? listing.category}
            </span>
            <h1 className="mt-2 text-2xl font-extrabold leading-tight">{listing.name}</h1>
          </div>
        </div>

        {listing.description ? (
          <p className="mt-4 text-sm leading-6 text-[var(--capitao-text-secondary)]">{listing.description}</p>
        ) : null}

        {listing.address || listing.neighborhood ? (
          <div className="mt-4 flex items-start gap-2 text-xs text-[var(--capitao-text-secondary)]">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            <span>{[listing.address, listing.neighborhood].filter(Boolean).join(" · ")}</span>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          {listing.phone ? (
            <a href={`tel:${listing.phone}`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--capitao-primary-900)] px-5 text-xs font-bold text-white">
              <Phone className="size-4" /> Ligar
            </a>
          ) : null}
          {whatsapp ? (
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--capitao-primary-100)] px-5 text-xs font-bold text-[var(--capitao-primary-900)]"
            >
              <MessageCircle className="size-4" /> WhatsApp
            </a>
          ) : null}
          {listing.latitude && listing.longitude ? (
            <a
              href={`https://www.openstreetmap.org/?mlat=${listing.latitude}&mlon=${listing.longitude}#map=17/${listing.latitude}/${listing.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--capitao-neutral-100)] px-5 text-xs font-bold text-[var(--capitao-text-secondary)]"
            >
              <MapPin className="size-4" /> Ver no mapa
            </a>
          ) : null}
        </div>
      </article>

      {listing.latitude && listing.longitude ? (
        <PublicListingMap lat={listing.latitude} lng={listing.longitude} containerId="public-map" />
      ) : null}
    </main>
  );
}
