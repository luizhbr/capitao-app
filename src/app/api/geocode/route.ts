import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type CachedResult = {
  expiresAt: number;
  results: Array<{
    latitude: number;
    longitude: number;
    displayName: string;
  }>;
};

const cache = new Map<string, CachedResult>();
let lastProviderRequestAt = 0;

function normalizedKey(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return NextResponse.json({ error: "Entre na sua conta para localizar um endereço." }, { status: 401 });
  }

  const address = (request.nextUrl.searchParams.get("address") ?? "").trim();
  const neighborhood = (request.nextUrl.searchParams.get("neighborhood") ?? "").trim();

  if (address.length < 3 || address.length > 200 || neighborhood.length > 100) {
    return NextResponse.json({ error: "Endereço inválido." }, { status: 400 });
  }

  const query = [address, neighborhood, "Capitão Andrade", "Minas Gerais", "Brasil"]
    .filter(Boolean)
    .join(", ");

  const key = normalizedKey(query);
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && cached.expiresAt > now) {
    return NextResponse.json({ results: cached.results, cached: true });
  }

  const waitMs = Math.max(0, 1100 - (now - lastProviderRequestAt));
  if (waitMs) {
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
  lastProviderRequestAt = Date.now();

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "5");
  url.searchParams.set("countrycodes", "br");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("viewbox", "-41.94,-18.98,-41.67,-19.15");
  url.searchParams.set("bounded", "1");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "CAPITAO-App/0.6 (+https://capitao-preview.luiz-ztx.workers.dev)",
      "Accept": "application/json",
      "Accept-Language": "pt-BR,pt;q=0.9",
    },
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Serviço de localização temporariamente indisponível." }, { status: 502 });
  }

  const raw = await response.json() as Array<{
    lat?: string;
    lon?: string;
    display_name?: string;
  }>;

  const results = raw.flatMap((item) => {
    const latitude = Number(item.lat);
    const longitude = Number(item.lon);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return [];

    return [{
      latitude,
      longitude,
      displayName: item.display_name ?? query,
    }];
  });

  cache.set(key, {
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    results,
  });

  return NextResponse.json(
    { results, cached: false },
    {
      headers: {
        "Cache-Control": "private, max-age=3600",
      },
    },
  );
}
