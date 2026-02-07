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
    fetch(`/api/documents/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setDoc(data);
        setContent(data.content);
      });
  }, [id]);

  const handleSave = async (newStatus?: string) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          status: newStatus || doc?.status,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setDoc((prev) => prev ? { ...prev, status: updated.status } : null);
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
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Editor Header */}
      <header className="h-14 border-b bg-white flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/collections/${doc.node.collection.id}`}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center text-sm text-slate-500">
            <span>{doc.node.collection.name}</span>
            <ChevronRight className="w-4 h-4 mx-1" />
            <span className="font-semibold text-slate-900">{doc.node.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-slate-400 mr-4">
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

          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setIsEditing(true)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all",
                isEditing ? "bg-white shadow-sm text-blue-600" : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Editor
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all",
                !isEditing ? "bg-white shadow-sm text-blue-600" : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200 mx-1" />

          {doc.status === "PUBLISHED" ? (
            <button
              onClick={() => handleSave("DRAFT")}
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              Mudar para Rascunho
            </button>
          ) : (
            <button
              onClick={() => handleSave("PUBLISHED")}
              className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              Publicar
            </button>
          )}

          <button
            onClick={() => handleSave()}
            disabled={isSaving}
            className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Salvar
          </button>
        </div>
      </header>

      {/* Editor Content */}
      <div className="flex-1 flex overflow-hidden">
        {isEditing ? (
          <div className="flex-1 flex flex-col bg-slate-50">
            <textarea
              className="flex-1 p-8 outline-none resize-none bg-transparent font-mono text-sm leading-relaxed"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# Comece a escrever seu markdown aqui..."
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto bg-white">
            <div className="max-w-4xl mx-auto px-8 py-12">
              <MarkdownRenderer content={content} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
