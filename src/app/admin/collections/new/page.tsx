"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookPlus, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCollectionPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, customDomain }),
      });

      if (res.ok) {
        const collection = await res.json();
        router.push(`/admin/collections/${collection.id}`);
        router.refresh();
      } else {
        const msg = await res.text();
        setError(msg || "Erro ao criar categoria.");
      }
    } catch (err) {
      setError("Erro de rede ao criar categoria.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para o Dashboard
      </Link>

      <div className="bg-sidebar border border-border rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
          <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
            <BookPlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Nova Categoria</h1>
            <p className="text-slate-400 text-sm">Crie um novo espaço para sua documentação.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 p-4 rounded-lg text-sm mb-6 border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Nome da Categoria
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-black border border-white/5 rounded-lg focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all text-white placeholder:text-zinc-700"
              placeholder="Ex: Documentação Interna, API Pública..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Domínio Customizado (Opcional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className="w-full px-4 py-2 bg-black border border-white/5 rounded-lg focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all text-white placeholder:text-zinc-700"
                placeholder="Ex: docs.suaempresa.com"
              />
              <p className="mt-1.5 text-[11px] text-zinc-500">
                Se definido, esta categoria responderá apenas neste domínio.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Descrição (Opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-black border border-white/5 rounded-lg focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all text-white placeholder:text-zinc-700 min-h-[100px]"
              placeholder="Sobre o que é esta documentação?"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-900 to-black text-white py-3 rounded-xl font-bold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50 shadow-xl shadow-green-900/10 border border-green-500/20"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Criar e Publicar"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
