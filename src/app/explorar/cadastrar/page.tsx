import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ListingForm } from "@/components/capitao/listing-form";

export default function CadastrarPage() {
  return (
    <main className="mx-auto min-h-svh max-w-md px-5 py-8">
      <Link href="/explorar" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--capitao-primary-700)]">
        <ArrowLeft className="size-4" /> Explorar
      </Link>

      <header className="mt-7 mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--capitao-primary-500)]">Diretório local</p>
        <h1 className="mt-2 text-3xl font-extrabold">Cadastrar negócio ou serviço</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--capitao-text-secondary)]">Envie as informações. Por segurança, novos cadastros entram como pendentes até serem publicados.</p>
      </header>

      <ListingForm />
    </main>
  );
}
