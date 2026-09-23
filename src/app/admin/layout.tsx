import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserRoles } from "@/lib/auth/roles";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!process.env.SUPABASE_SECRET_KEY) {
    return (
      <main className="mx-auto min-h-svh max-w-md px-5 py-10">
        <div className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)]">
          <ShieldAlert className="size-8 text-amber-500" />
          <h1 className="mt-4 text-2xl font-extrabold">Painel indisponível</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--capitao-text-secondary)]">
            O servidor não tem a chave de administração configurada. Defina{" "}
            <code className="rounded bg-black/5 px-1">SUPABASE_SECRET_KEY</code> como variável de
            ambiente do servidor para habilitar o painel.
          </p>
          <Link href="/" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--capitao-primary-900)] px-5 text-sm font-bold text-white">
            <ArrowLeft className="size-4" /> Voltar ao início
          </Link>
        </div>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const roles = await getUserRoles(user?.id);

  if (!user || roles.length === 0) {
    return (
      <main className="mx-auto min-h-svh max-w-md px-5 py-10">
        <div className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)]">
          <ShieldAlert className="size-7 text-amber-500" />
          <h1 className="mt-4 text-2xl font-extrabold">Acesso restrito</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--capitao-text-secondary)]">
            Esta área é reservada a moderadores e administradores autorizados. Se você tem um papel,
            entre com a conta correta em <Link href="/perfil" className="font-bold underline">Perfil</Link>.
          </p>
          <Link href="/" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--capitao-primary-900)] px-5 text-sm font-bold text-white">
            <ArrowLeft className="size-4" /> Voltar ao início
          </Link>
        </div>
      </main>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}

function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-svh max-w-6xl flex-col md:flex-row">
      <aside className="border-b border-black/[0.06] bg-white p-4 md:w-64 md:shrink-0 md:border-b-0 md:border-r">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--capitao-primary-700)]">
          <ArrowLeft className="size-4" /> CAPITÃO
        </Link>
        <nav className="mt-4 flex gap-1 overflow-x-auto md:flex-col" aria-label="Painel admin">
          {([
            ["/admin", "Visão geral"],
            ["/admin/cadastros", "Cadastros"],
          ] as const).map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="flex min-h-11 shrink-0 items-center gap-2 rounded-2xl px-4 text-sm font-bold text-[var(--capitao-text-secondary)] hover:bg-black/[0.035]"
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1 p-5 pb-16">{children}</div>
    </div>
  );
}
