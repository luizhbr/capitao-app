import Link from "next/link";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return <main className="grid min-h-svh place-items-center p-6 text-center"><div className="max-w-sm rounded-[28px] bg-white p-8 shadow-[var(--shadow-featured)]"><div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[var(--capitao-primary-100)]"><WifiOff className="size-8 text-[var(--capitao-primary-700)]" /></div><h1 className="mt-5 text-2xl font-extrabold">Você está offline</h1><p className="mt-2 text-sm text-[var(--capitao-text-secondary)]">Quando a conexão voltar, o CAPITÃO continua daqui.</p><Link href="/" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-[var(--capitao-primary-700)] px-5 text-sm font-bold text-white">Tentar novamente</Link></div></main>;
}
