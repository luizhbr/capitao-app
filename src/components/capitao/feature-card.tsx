import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  commerce: "bg-[var(--capitao-primary-100)]",
  food: "bg-[var(--capitao-tourism-100)]",
  services: "bg-[var(--capitao-tech-100)]",
  tourism: "bg-[var(--capitao-solar-100)]",
  coop: "bg-[var(--capitao-coop-100)]",
} as const;

export function FeatureCard({title,subtitle,icon:Icon,tone="commerce"}:{title:string;subtitle:string;icon:LucideIcon;tone?:keyof typeof tones}) {
  return <button className={cn("group relative min-h-32 w-full overflow-hidden rounded-[var(--radius-card)] p-4 text-left shadow-[var(--shadow-card)] transition active:scale-[0.98]",tones[tone])}><div className="mb-6 flex items-center justify-between"><span className="grid size-11 place-items-center rounded-2xl bg-white/80 shadow-sm"><Icon className="size-6"/></span><span className="grid size-9 place-items-center rounded-full bg-white/80 opacity-0 shadow-sm transition group-hover:opacity-100"><ArrowRight className="size-4"/></span></div><p className="font-bold">{title}</p><p className="mt-0.5 text-xs text-[var(--capitao-text-secondary)]">{subtitle}</p></button>;
}
