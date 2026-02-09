"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Loader2, 
  Plus, 
  Copy, 
  Check, 
  Globe, 
  Layers,
  Search,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Collection {
  id: string;
  name: string;
  site: {
    name: string;
  };
}

interface CreateSiteFormProps {
  collections: Collection[];
}

export function CreateSiteForm({ collections }: CreateSiteFormProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [mode, setMode] = useState<"scratch" | "existing">("scratch");
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
  });

  const filteredCollections = collections.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.site.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          collectionId: mode === "existing" ? selectedCollectionId : undefined,
        }),
      });

      if (!res.ok) throw new Error("Erro ao criar site");

      const site = await res.json();
      router.push(`/admin/sites/${site.id}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Falha ao criar workspace.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Escolha de Modo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setMode("scratch")}
          className={cn(
            "p-6 rounded-xl border-2 text-left transition-all group",
            mode === "scratch" 
              ? "border-green-500 bg-green-500/5" 
              : "border-border hover:border-zinc-700 bg-white/5"
          )}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={cn(
              "p-2 rounded-lg transition-colors",
              mode === "scratch" ? "bg-green-500 text-black" : "bg-white/10 text-zinc-400 group-hover:text-white"
            )}>
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white">Criar do Zero</h3>
          </div>
          <p className="text-sm text-zinc-400">Comece um novo workspace limpo para sua documentação.</p>
        </button>

        <button
          type="button"
          onClick={() => setMode("existing")}
          className={cn(
            "p-6 rounded-xl border-2 text-left transition-all group",
            mode === "existing" 
              ? "border-green-500 bg-green-500/5" 
              : "border-border hover:border-zinc-700 bg-white/5"
          )}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={cn(
              "p-2 rounded-lg transition-colors",
              mode === "existing" ? "bg-green-500 text-black" : "bg-white/10 text-zinc-400 group-hover:text-white"
            )}>
              <Copy className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white">Usar Documentação Existente</h3>
          </div>
          <p className="text-sm text-zinc-400">Selecione uma coleção já criada para ser a base deste workspace.</p>
        </button>
      </div>

      {/* Dados Básicos */}
      <div className="bg-[#050505] border border-border rounded-xl p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Nome do Workspace
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                const val = e.target.value;
                setFormData({ 
                  ...formData, 
                  name: val,
                  slug: formData.slug || val.toLowerCase().replace(/ /g, "-").replace(/[^\w-]/g, "")
                });
              }}
              className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
              placeholder="Ex: API Docs"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Slug do Subdomínio
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/ /g, "-").replace(/[^\w-]/g, "") })}
                className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                placeholder="ex: api-docs"
                required
              />
            </div>
            <p className="text-[10px] text-zinc-500 italic">Disponível em: {formData.slug || "slug"}.cloudstage.com.br</p>
          </div>
        </div>

        {/* Seleção de Coleção (se modo existing) */}
        {mode === "existing" && (
          <div className="space-y-4 pt-6 border-t border-border/50">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-3 h-3" />
              Selecione a Coleção
            </label>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Pesquisar coleções..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-green-500/50"
              />
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
              {filteredCollections.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setSelectedCollectionId(col.id)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all text-left",
                    selectedCollectionId === col.id
                      ? "border-green-500 bg-green-500/10"
                      : "border-border hover:border-zinc-700 bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-1.5 rounded bg-white/5",
                      selectedCollectionId === col.id ? "text-green-500" : "text-zinc-500"
                    )}>
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{col.name}</div>
                      <div className="text-[10px] text-zinc-500">Workspace: {col.site.name}</div>
                    </div>
                  </div>
                  {selectedCollectionId === col.id && (
                    <div className="bg-green-500 rounded-full p-1">
                      <Check className="w-3 h-3 text-black" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-zinc-500 hover:text-white transition-colors"
        >
          Cancelar
        </button>
        
        <button
          type="submit"
          disabled={isCreating || (mode === "existing" && !selectedCollectionId)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 disabled:cursor-not-allowed text-black font-bold py-2.5 px-8 rounded-lg transition-all shadow-lg shadow-green-500/20"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Criando Workspace...
            </>
          ) : (
            <>
              <Globe className="w-4 h-4" />
              Criar Workspace
            </>
          )}
        </button>
      </div>
    </form>
  );
}
