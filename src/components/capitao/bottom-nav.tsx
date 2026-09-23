"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Compass, Handshake, Home, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Início", icon: Home },
  { href: "/explorar", label: "Explorar", icon: Compass },
  { href: "/coopera", label: "Coopera", icon: Handshake },
  { href: "/cidade", label: "Cidade", icon: Building2 },
  { href: "/perfil", label: "Perfil", icon: UserRound },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return <nav className="fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-50 mx-auto max-w-md rounded-[32px] border border-black/[0.06] bg-white/92 p-2 shadow-[var(--shadow-floating)] backdrop-blur-xl" aria-label="Navegação principal"><div className="grid grid-cols-5 gap-1">{items.map(({href,label,icon:Icon})=>{const active=href==="/"?pathname==="/":pathname.startsWith(href);return <Link key={href} href={href} className={cn("flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-semibold transition",active?"bg-[var(--capitao-primary-100)] text-[var(--capitao-primary-900)]":"text-[var(--capitao-text-secondary)] hover:bg-black/[0.035]")}><Icon className="size-5" strokeWidth={active?2.4:1.9}/><span>{label}</span></Link>})}</div></nav>;
}
