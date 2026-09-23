"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LogIn, LogOut, Plus, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function PerfilPage() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [listings, setListings] = useState<Array<{ id: string; name: string; category: string; status: string }>>([]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const currentEmail = data.user?.email ?? null;
      setUserEmail(currentEmail);
      if (currentEmail) {
        const { data: rows } = await supabase
          .from("listings")
          .select("id,name,category,status")
          .order("created_at", { ascending: false });
        setListings(rows ?? []);
      }
    });
  }, [supabase]);

  async function signIn() {
    setBusy(true);
    setMessage("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setMessage(error.message);
    setUserEmail(data.user.email ?? email);
    const { data: rows } = await supabase
      .from("listings")
      .select("id,name,category,status")
      .order("created_at", { ascending: false });
    setListings(rows ?? []);
    setMessage("Login realizado.");
  }

  async function signUp() {
    setBusy(true);
    setMessage("");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: email.split("@")[0] } },
    });
    setBusy(false);
    if (error) return setMessage(error.message);
    setUserEmail(data.user?.email ?? null);
    setMessage(data.session ? "Conta criada e sessão iniciada." : "Conta criada. Confirme seu e-mail para entrar.");
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUserEmail(null);
    setListings([]);
    setMessage("Sessão encerrada.");
  }

  return (
    <main className="mx-auto min-h-svh max-w-md px-5 py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--capitao-primary-700)]">
        <ArrowLeft className="size-4" /> Voltar
      </Link>

      <div className="mt-8 rounded-[28px] bg-white p-6 shadow-[var(--shadow-featured)]">
        <div className="grid size-14 place-items-center rounded-2xl bg-[var(--capitao-primary-100)]">
          <UserRound className="size-7 text-[var(--capitao-primary-900)]" />
        </div>

        <h1 className="mt-5 text-3xl font-extrabold">Perfil</h1>

        {userEmail ? (
          <div className="mt-5">
            <p className="text-sm text-[var(--capitao-text-secondary)]">Você está conectado como</p>
            <p className="mt-1 font-bold">{userEmail}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/explorar/cadastrar" className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[var(--capitao-primary-100)] px-4 text-sm font-bold text-[var(--capitao-primary-900)]">
                <Plus className="size-4" /> Novo cadastro
              </Link>
              <button onClick={signOut} className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[var(--capitao-primary-900)] px-4 text-sm font-bold text-white">
                <LogOut className="size-4" /> Sair
              </button>
            </div>

            <section className="mt-7">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="font-extrabold">Meus cadastros</h2>
                  <p className="text-xs text-[var(--capitao-text-secondary)]">Você vê seus próprios itens mesmo enquanto estão pendentes.</p>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {listings.length ? listings.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-[var(--capitao-bg)] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{item.name}</p>
                        <p className="mt-0.5 text-[11px] text-[var(--capitao-text-secondary)]">{item.category}</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${item.status === "published" ? "bg-[var(--capitao-primary-100)] text-[var(--capitao-primary-900)]" : item.status === "rejected" ? "bg-red-50 text-red-700" : "bg-[var(--capitao-solar-100)] text-[#8a6500]"}`}>
                        {item.status === "published" ? "Publicado" : item.status === "rejected" ? "Rejeitado" : "Pendente"}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-2xl bg-[var(--capitao-bg)] p-4 text-sm text-[var(--capitao-text-secondary)]">
                    Você ainda não enviou nenhum cadastro.
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">E-mail</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" className="min-h-12 w-full rounded-2xl border border-black/10 bg-[var(--capitao-bg)] px-4 outline-none focus:border-[var(--capitao-primary-500)]" placeholder="voce@email.com" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">Senha</span>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" minLength={8} className="min-h-12 w-full rounded-2xl border border-black/10 bg-[var(--capitao-bg)] px-4 outline-none focus:border-[var(--capitao-primary-500)]" placeholder="Mínimo 8 caracteres" />
            </label>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button disabled={busy || !email || password.length < 8} onClick={signIn} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--capitao-primary-900)] px-4 text-sm font-bold text-white disabled:opacity-40">
                <LogIn className="size-4" /> Entrar
              </button>
              <button disabled={busy || !email || password.length < 8} onClick={signUp} className="min-h-12 rounded-2xl bg-[var(--capitao-primary-100)] px-4 text-sm font-bold text-[var(--capitao-primary-900)] disabled:opacity-40">
                Criar conta
              </button>
            </div>
          </div>
        )}

        {message ? <p className="mt-4 rounded-2xl bg-[var(--capitao-neutral-100)] p-3 text-xs">{message}</p> : null}
      </div>
    </main>
  );
}
