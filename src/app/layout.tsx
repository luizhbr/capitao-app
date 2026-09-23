import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "./globals.css";
import { PwaRegister } from "@/components/pwa/pwa-register";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: "CAPITÃO — Nossa cidade conectada", template: "%s | CAPITÃO" },
  description: "Plataforma comunitária de Capitão Andrade: economia local, turismo, cooperativas, tecnologia e Capitão 2040.",
  applicationName: "CAPITÃO",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "CAPITÃO" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B5135",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body><PwaRegister />{children}</body></html>;
}
