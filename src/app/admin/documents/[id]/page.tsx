"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  Save, 
  Eye, 
  Edit3, 
  ArrowLeft, 
  Check, 
  Loader2, 
  Globe, 
  Lock,
  ChevronRight
} from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface DocumentData {
  id: string;
  content: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  node: {
    id: string;
    name: string;
    collection: {
      id: string;
      name: string;
      slug: string;
    }
  }
}

export default function DocumentEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [doc, setDoc] = useState<DocumentData | null>(null);
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/nodes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setDoc({
          id: data.id,
          content: data.content?.markdown || "",
          status: data.published ? "PUBLISHED" : "DRAFT",
          node: {
            id: data.id,
            name: data.name,
            collection: data.collection
          }
        });
        setContent(data.content?.markdown || "");
      });
  }, [id]);

  const handleSave = async (newStatus?: string) => {
    setIsSaving(true);
    try {
      const isPublished = newStatus ? newStatus === "PUBLISHED" : doc?.status === "PUBLISHED";
      const res = await fetch(`/api/nodes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown: content,
          published: isPublished,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setDoc((prev) => prev ? { ...prev, status: updated.published ? "PUBLISHED" : "DRAFT" } : null);
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!doc) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-black text-white">
      {/* Editor Header */}
      <header className="h-14 border-b border-white/5 bg-[#050505] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/collections/${doc.node.collection.id}`}
            className="p-2 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center text-sm text-zinc-500">
            <span>{doc.node.collection.name}</span>
            <ChevronRight className="w-4 h-4 mx-1" />
            <span className="font-semibold text-white">{doc.node.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-zinc-500 mr-4">
            {isSaving ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Salvando...
              </>
            ) : lastSaved ? (
              <>
                <Check className="w-3 h-3 text-green-500" />
                Salvo às {lastSaved.toLocaleTimeString()}
              </>
            ) : null}
          </div>

          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setIsEditing(true)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all",
                isEditing ? "bg-green-500/10 text-green-400 shadow-sm" : "text-zinc-400 hover:text-white"
              )}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Editor
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all",
                !isEditing ? "bg-green-500/10 text-green-400 shadow-sm" : "text-zinc-400 hover:text-white"
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
          </div>

          <div className="h-6 w-px bg-white/10 mx-1" />

          {doc.status === "PUBLISHED" ? (
            <button
              onClick={() => handleSave("DRAFT")}
              className="px-3 py-1.5 text-xs font-medium border border-white/10 rounded-lg hover:bg-white/5 text-zinc-300 flex items-center gap-1.5 transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              Mudar para Rascunho
            </button>
          ) : (
            <button
              onClick={() => handleSave("PUBLISHED")}
              className="px-3 py-1.5 text-xs font-medium bg-green-600/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-600/30 flex items-center gap-1.5 transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              Publicar
            </button>
          )}

          <button
            onClick={() => handleSave()}
            disabled={isSaving}
            className="px-4 py-1.5 text-xs font-bold bg-white text-black rounded-lg hover:bg-zinc-200 disabled:opacity-50 flex items-center gap-1.5 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            Salvar
          </button>
        </div>
      </header>

      {/* Editor Content */}
      <div className="flex-1 flex overflow-hidden">
        {isEditing ? (
          <div className="flex-1 flex flex-col bg-[#0a0a0a]">
            <textarea
              className="flex-1 p-8 outline-none resize-none bg-transparent font-mono text-sm leading-relaxed text-zinc-300 placeholder:text-zinc-700"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# Comece a escrever seu markdown aqui..."
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto bg-black">
            <div className="max-w-4xl mx-auto px-8 py-12">
              <MarkdownRenderer content={content} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
