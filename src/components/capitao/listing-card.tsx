import { Building2, MapPin, MessageCircle, Phone } from "lucide-react";

export type DirectoryListing = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  neighborhood: string | null;
};

const labels: Record<string, string> = {
  commerce: "Comércio",
  food: "Comida",
  services: "Serviços",
  tourism: "Turismo",
  producer: "Feito em Capitão",
  tech: "Tecnologia",
};

function digits(value: string) {
  return value.replace(/\D/g, "");
}

export function ListingCard({ listing }: { listing: DirectoryListing }) {
  const whatsapp = listing.whatsapp ? digits(listing.whatsapp) : "";

  return (
    <article className="rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-4">
        <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--capitao-primary-100)]">
          <Building2 className="size-7 text-[var(--capitao-primary-900)]" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="rounded-full bg-[var(--capitao-neutral-100)] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--capitao-text-secondary)]">
            {labels[listing.category] ?? listing.category}
          </span>
          <h2 className="mt-2 text-lg font-extrabold leading-tight">{listing.name}</h2>
          {listing.description ? (
            <p className="mt-2 text-sm leading-5 text-[var(--capitao-text-secondary)]">{listing.description}</p>
          ) : null}
        </div>
      </div>

      {(listing.address || listing.neighborhood) ? (
        <div className="mt-4 flex items-start gap-2 text-xs text-[var(--capitao-text-secondary)]">
          <MapPin className="mt-0.5 size-4 shrink-0" />
          <span>{[listing.address, listing.neighborhood].filter(Boolean).join(" · ")}</span>
        </div>
      ) : null}

      {(listing.phone || whatsapp) ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {listing.phone ? (
            <a href={`tel:${listing.phone}`} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--capitao-neutral-100)] px-4 text-xs font-bold">
              <Phone className="size-4" /> Ligar
            </a>
          ) : null}
          {whatsapp ? (
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--capitao-primary-100)] px-4 text-xs font-bold text-[var(--capitao-primary-900)]">
              <MessageCircle className="size-4" /> WhatsApp
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
