import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <main className="mx-auto min-h-svh max-w-md px-5 py-10">
      <div className="rounded-[28px] bg-white p-6 shadow-[var(--shadow-featured)]">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--capitao-primary-500)]">Autenticação</p>
        <h1 className="mt-2 text-2xl font-extrabold">Não foi possível concluir o login</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--capitao-text-secondary)]">
          Tente novamente. Se o login com Google ainda não estiver habilitado no Supabase, o administrador precisa concluir a configuração do provedor.
        </p>
        <Link href="/perfil" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[var(--capitao-primary-900)] px-5 text-sm font-bold text-white">
          Voltar ao perfil
        </Link>
      </div>
    </main>
  );
}
