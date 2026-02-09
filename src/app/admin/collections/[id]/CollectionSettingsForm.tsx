"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Hash, Type, CheckCircle2 } from "lucide-react";
import { IconPicker } from "@/components/IconPicker";
import { IconDisplay } from "@/components/IconDisplay";

interface Collection {
  id: string;
  name: string;
  slug: string;
  isDefault: boolean;
  description?: string | null;
  icon?: string | null;
}

export function CollectionSettingsForm({ collection }: { collection: Collection }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: collection.name,
    slug: collection.slug,
    description: collection.description || "",
    icon: collection.icon || "📚",
    isDefault: collection.isDefault,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/collections/${collection.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Erro ao atualizar coleção");

      router.refresh();
      alert("Coleção atualizada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Falha ao atualizar coleção");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 bg-[#050505] border border-border rounded-xl p-8 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              <Type className="w-3 h-3" />
              Nome da Coleção
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                className="h-[42px] w-[42px] bg-white/5 border border-border rounded-lg flex items-center justify-center text-xl hover:bg-white/10 transition-all"
                onClick={() => setShowIconPicker(true)}
              >
                <IconDisplay 
                  icon={formData.icon} 
                  className="text-xl" 
                  fallback={<span className="text-xl">📚</span>} 
                />
              </button>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="flex-1 bg-white/5 border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                placeholder="Ex: Documentação de Produto"
                required
              />
            </div>
          </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <Hash className="w-3 h-3" />
            Slug da Coleção
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/ /g, "-") })}
            className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
            placeholder="ex: api-docs"
            required
          />
          <p className="text-[10px] text-zinc-500 italic">Caminho na URL: /{formData.slug}</p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Descrição
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all h-24 resize-none"
            placeholder="Uma breve descrição sobre o que esta coleção contém..."
          />
        </div>

        <div className="flex items-center gap-3 md:col-span-2">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              formData.isDefault 
                ? "bg-green-500/10 border-green-500 text-green-500" 
                : "bg-white/5 border-border text-zinc-500 hover:text-white"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">Coleção Padrão (Default)</span>
          </button>
          <p className="text-[10px] text-zinc-500 max-w-xs">
            A coleção padrão é exibida quando o usuário acessa o domínio raiz do site.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end pt-4 border-t border-border/50">
        <button
          type="submit"
          disabled={isUpdating}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-black font-bold py-2.5 px-6 rounded-lg transition-all shadow-lg shadow-green-500/20"
        >
          {isUpdating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Salvar Alterações
            </>
          )}
        </button>
      </div>
    </form>

      {showIconPicker && (
        <IconPicker
          currentIcon={formData.icon}
          onSelect={(icon) => setFormData({ ...formData, icon })}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </>
  );
}
