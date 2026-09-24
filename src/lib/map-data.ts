import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/security/public-config";
import type { CapitaoMapPoint } from "@/lib/map-types";

export const categoryLabels: Record<string, string> = {
  commerce: "Comércio",
  food: "Comida",
  services: "Serviços",
  tourism: "Turismo",
  producer: "Feito em Capitão",
  tech: "Tecnologia",
};

export async function getPublishedMapPoints(limit = 300): Promise<CapitaoMapPoint[]> {
  if (!supabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("listings")
      .select("id,name,category,latitude,longitude")
      .eq("status", "published")
      .eq("is_active", true)
      .not("latitude", "is", null)
      .not("longitude", "is", null)
      .limit(limit);

    if (error) return [];

    return (data ?? []).flatMap((row) => {
      const item = row as {
        id: string;
        name: string;
        category: string;
        latitude: number | null;
        longitude: number | null;
      };

      if (typeof item.latitude !== "number" || typeof item.longitude !== "number") return [];

      return [{
        id: item.id,
        name: item.name,
        category: item.category,
        categoryLabel: categoryLabels[item.category] ?? item.category,
        latitude: item.latitude,
        longitude: item.longitude,
      }];
    });
  } catch {
    return [];
  }
}
