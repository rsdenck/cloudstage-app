import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4">
      <div className="max-w-md w-full bg-[#0A0A0A] border border-white/5 rounded-2xl p-8 text-center shadow-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mb-6">
          <FileQuestion className="w-8 h-8 text-green-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">404 - Não Encontrado</h2>
        <p className="text-zinc-500 mb-8 text-sm leading-relaxed">
          A página que você está procurando não existe ou foi movida para um novo endereço.
        </p>

        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98]"
        >
          <Home className="w-4 h-4" />
          Voltar para o início
        </Link>
      </div>
    </div>
  );
}
