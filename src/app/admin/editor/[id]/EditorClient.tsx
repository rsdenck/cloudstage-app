"use client";

import { useState, useEffect } from "react";
import { Save, Eye, MoreHorizontal, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { cn } from "@/lib/utils";

interface EditorClientProps {
  node: any;
  breadcrumbs: any[];
}

export function EditorClient({ node, breadcrumbs }: EditorClientProps) {
  const [name, setName] = useState(node.name);
  const [markdown, setMarkdown] = useState(node.content?.markdown || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    if (saveStatus !== "idle") {
      const timer = setTimeout(() => setSaveStatus("idle"), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      const response = await fetch(`/api/nodes/${node.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name,
          markdown 
        }),
      });

      if (!response.ok) throw new Error("Falha ao salvar");
      
      setSaveStatus("success");
    } catch (error) {
      console.error(error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Top Bar Editor */}
      <header className="h-14 border-b border-border/50 flex items-center justify-between px-6 bg-[#050505] sticky top-0 z-30">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Breadcrumbs items={breadcrumbs} className="text-xs opacity-50 hover:opacity-100 transition-opacity truncate max-w-md" />
          <div className="h-4 w-[1px] bg-border/50 mx-2 hidden md:block" />
          <div className="flex items-center gap-2">
            <span className={cn(
              "w-2 h-2 rounded-full",
              node.published ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-zinc-600"
            )} />
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
              {node.published ? "Publicado" : "Rascunho"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveStatus === "success" && (
            <span className="flex items-center gap-1.5 text-green-500 text-[11px] font-medium animate-in fade-in slide-in-from-right-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Salvo com sucesso
            </span>
          )}
          {saveStatus === "error" && (
            <span className="flex items-center gap-1.5 text-red-500 text-[11px] font-medium animate-in fade-in slide-in-from-right-2">
              <AlertCircle className="w-3.5 h-3.5" />
              Erro ao salvar
            </span>
          )}

          <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <Eye className="w-3.5 h-3.5" />
            Visualizar
          </button>
          <div className="h-4 w-[1px] bg-border/50 mx-1" />
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-1.5 bg-green-500 text-black text-xs font-bold rounded-lg hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/10"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {isSaving ? "Salvando..." : "Salvar"}
          </button>
          <button className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Editor */}
      <main className="flex-1 overflow-y-auto no-scrollbar py-12 px-6 md:px-12 lg:px-24 max-w-5xl mx-auto w-full">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-4">
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Título do Documento"
              className="w-full bg-transparent border-none p-0 text-4xl md:text-5xl font-bold text-white placeholder:text-zinc-800 focus:ring-0"
            />
            <input 
              type="text" 
              placeholder="Adicionar um subtítulo..."
              className="w-full bg-transparent border-none p-0 text-xl text-zinc-500 placeholder:text-zinc-800 focus:ring-0"
            />
          </div>

          <div className="min-h-[500px] border-t border-border/30 pt-8">
            <textarea 
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Comece a escrever aqui..."
              className="w-full h-full bg-transparent border-none p-0 text-zinc-300 text-lg leading-relaxed focus:ring-0 resize-none placeholder:text-zinc-800"
              style={{ minHeight: '500px' }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
