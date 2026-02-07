'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4">
      <div className="max-w-md w-full bg-[#0A0A0A] border border-white/5 rounded-2xl p-8 text-center shadow-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Ops! Algo deu errado.</h2>
        <p className="text-zinc-500 mb-8 text-sm leading-relaxed">
          Ocorreu um erro inesperado ao carregar esta página. Nossa equipe foi notificada.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98]"
          >
            <RefreshCcw className="w-4 h-4" />
            Tentar novamente
          </button>
          
          <a
            href="/"
            className="text-zinc-500 hover:text-white text-sm transition-colors"
          >
            Voltar para o início
          </a>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-black/50 rounded-lg text-left overflow-auto max-h-40">
            <p className="text-red-400 text-[10px] font-mono break-all">
              {error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
