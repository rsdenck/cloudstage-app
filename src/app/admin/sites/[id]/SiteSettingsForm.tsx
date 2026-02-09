"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Globe, Hash, Type, Settings, Plus } from "lucide-react";
import { IconPicker } from "@/components/IconPicker";
import { IconDisplay } from "@/components/IconDisplay";

interface Site {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  icon: string | null;
  status: string;
}

export function SiteSettingsForm({ site }: { site: Site }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: site.name,
    slug: site.slug,
    domain: site.domain || "",
    icon: site.icon || "🌐",
    status: site.status,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/sites/${site.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "Erro ao atualizar site");
      }

      router.refresh();
      alert("Configurações atualizadas com sucesso!");
    } catch (error: any) {
      console.error(error);
      alert(`Falha ao atualizar: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6 bg-[#050505] border border-border rounded-xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 pb-6 border-b border-border/50">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Settings className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Configurações Gerais</h2>
            <p className="text-xs text-zinc-500">Configure a identidade e acesso do seu workspace.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              <Type className="w-3 h-3" />
              Nome do Workspace
            </label>
            <div className="flex gap-3">
              <div className="relative group">
                <button
                  type="button"
                  className="h-[42px] w-[42px] bg-white/5 border border-border rounded-lg flex items-center justify-center text-xl hover:bg-white/10 transition-all"
                  onClick={() => setShowIconPicker(true)}
                >
                  <IconDisplay 
                    icon={formData.icon} 
                    className="text-xl" 
                    fallback={<Globe className="w-5 h-5 text-zinc-600" />} 
                  />
                </button>
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="flex-1 bg-white/5 border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                placeholder="Ex: Minha Documentação"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              <Hash className="w-3 h-3" />
              Subdomínio Cloudstage
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/ /g, "-") })}
                className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                placeholder="ex: docs-oficial"
                required
              />
            </div>
            <p className="text-[10px] text-zinc-500 italic">URL Pública: https://{formData.slug}.cloudstage.com.br</p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              <Globe className="w-3 h-3" />
              Domínio Personalizado
            </label>
            <input
              type="text"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
              placeholder="Ex: docs.suaempresa.com.br"
            />
            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg mt-2">
              <p className="text-[10px] text-blue-400 font-medium">Configuração de CNAME:</p>
              <p className="text-[10px] text-zinc-500 mt-1">
                Aponte o CNAME do seu domínio para: <code className="text-zinc-300">cname.cloudstage.com.br</code>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Visibilidade do Site
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all appearance-none"
            >
              <option value="DRAFT">Privado (Apenas Admin)</option>
              <option value="PUBLISHED">Público (Qualquer pessoa com o link)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end pt-6 border-t border-border/50">
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

      {/* Seção Estilo (Placeholders GitBook Style) */}
      <div className="bg-[#050505] border border-border rounded-xl p-8 opacity-60">
        <div className="flex items-center gap-3 pb-6 border-b border-border/50">
          <div className="p-2 bg-zinc-500/10 rounded-lg">
            <Plus className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-400">Aparência e Estilo (Em breve)</h2>
            <p className="text-xs text-zinc-500">Personalize as cores e logotipos do seu site público.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-4 border border-dashed border-border rounded-lg text-center space-y-2">
            <div className="text-xs font-bold text-zinc-500 uppercase">Logotipo</div>
            <div className="h-10 w-10 bg-white/5 rounded mx-auto flex items-center justify-center">
              <Plus className="w-4 h-4 text-zinc-600" />
            </div>
          </div>
          <div className="p-4 border border-dashed border-border rounded-lg text-center space-y-2">
            <div className="text-xs font-bold text-zinc-500 uppercase">Favicon</div>
            <div className="h-10 w-10 bg-white/5 rounded mx-auto flex items-center justify-center">
              <Plus className="w-4 h-4 text-zinc-600" />
            </div>
          </div>
          <div className="p-4 border border-dashed border-border rounded-lg text-center space-y-2">
            <div className="text-xs font-bold text-zinc-500 uppercase">Cor Primária</div>
            <div className="h-10 w-10 bg-green-500/20 rounded mx-auto flex items-center justify-center">
              <div className="h-4 w-4 bg-green-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
