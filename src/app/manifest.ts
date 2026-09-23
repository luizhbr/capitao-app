import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CAPITÃO — Nossa cidade conectada",
    short_name: "CAPITÃO",
    description: "Economia local, turismo, cooperativas, tecnologia e projetos de Capitão Andrade em uma única plataforma.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F8F5",
    theme_color: "#0B5135",
    orientation: "portrait-primary",
    lang: "pt-BR",
    categories: ["business", "travel", "social", "productivity"],
  };
}
