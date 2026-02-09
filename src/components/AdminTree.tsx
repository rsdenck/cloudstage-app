"use client";

import { useState } from "react";
import { 
  ChevronDown, 
  ChevronRight, 
  FileText, 
  Folder, 
  Plus, 
  MoreVertical, 
  Trash2, 
  Edit3,
  FilePlus,
  FolderPlus,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Node {
  id: string;
  name: string;
  slug: string;
  type: "FOLDER" | "DOCUMENT";
  parentId: string | null;
  children?: Node[];
  document?: { status: string } | null;
}

interface AdminTreeProps {
  initialTree: Node[];
  collectionId: string;
  collectionSlug: string;
}

export function AdminTree({ initialTree, collectionId, collectionSlug }: AdminTreeProps) {
  const [tree, setTree] = useState<Node[]>(initialTree);
  const [isAdding, setIsAdding] = useState<{ parentId: string | null; type: "FOLDER" | "DOCUMENT" } | null>(null);
  const [newName, setNewName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAddNode = async (parentId: string | null, type: "FOLDER" | "DOCUMENT") => {
    if (!newName.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          type,
          collectionId,
          parentId,
        }),
      });

      if (res.ok) {
        setNewName("");
        setIsAdding(null);
        router.refresh();
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveNode = async (nodeId: string, newParentId: string | null) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/nodes/${nodeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId: newParentId }),
      });

      if (res.ok) {
        router.refresh();
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
        <button
          onClick={() => setIsAdding({ parentId: null, type: "FOLDER" })}
          className="flex items-center gap-1 text-[12px] font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-md border border-white/5 hover:bg-white/5 transition-all"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          Pasta
        </button>
        <button
          onClick={() => setIsAdding({ parentId: null, type: "DOCUMENT" })}
          className="flex items-center gap-1 text-[12px] font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-md border border-white/5 hover:bg-white/5 transition-all"
        >
          <FilePlus className="w-3.5 h-3.5" />
          Documento
        </button>
      </div>

      {isAdding && isAdding.parentId === null && (
        <div className="flex items-center gap-2 p-2 bg-black/40 rounded-lg border border-white/5 mb-4">
          <input
            autoFocus
            className="flex-1 bg-black border border-white/10 rounded px-2 py-1 text-[12px] outline-none focus:border-green-500/50 text-white"
            placeholder={`Nome ${isAdding.type === "FOLDER" ? "da pasta" : "do documento"}`}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddNode(null, isAdding.type)}
          />
          <button
            onClick={() => handleAddNode(null, isAdding.type)}
            disabled={isLoading}
            className="p-1.5 bg-green-500/10 text-green-500 rounded hover:bg-green-500/20 transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
          </button>
          <button
            onClick={() => setIsAdding(null)}
            className="text-[12px] text-zinc-500 hover:text-zinc-400"
          >
            Cancelar
          </button>
        </div>
      )}

      <div 
        className="space-y-1 min-h-[50px]"
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          const nodeId = e.dataTransfer.getData("nodeId");
          if (nodeId) handleMoveNode(nodeId, null);
        }}
      >
        {tree.map((node) => (
          <AdminTreeItem
            key={node.id}
            node={node}
            collectionSlug={collectionSlug}
            collectionId={collectionId}
            level={0}
            isAdding={isAdding}
            setIsAdding={setIsAdding}
            newName={newName}
            setNewName={setNewName}
            handleAddNode={handleAddNode}
            handleMoveNode={handleMoveNode}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}

function AdminTreeItem({
  node,
  collectionSlug,
  collectionId,
  level,
  isAdding,
  setIsAdding,
  newName,
  setNewName,
  handleAddNode,
  handleMoveNode,
  isLoading
}: {
  node: Node;
  collectionSlug: string;
  collectionId: string;
  level: number;
  isAdding: { parentId: string | null; type: "FOLDER" | "DOCUMENT" } | null;
  setIsAdding: (val: any) => void;
  newName: string;
  setNewName: (val: string) => void;
  handleAddNode: (parentId: string | null, type: "FOLDER" | "DOCUMENT") => void;
  handleMoveNode: (nodeId: string, newParentId: string | null) => void;
  isLoading: boolean;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const isFolder = node.type === "FOLDER";
  const isPublished = node.document?.status === "PUBLISHED";

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("nodeId", node.id);
        e.stopPropagation();
      }}
      onDragOver={(e) => {
        if (isFolder) {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(true);
        }
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        if (isFolder) {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(false);
          const draggedNodeId = e.dataTransfer.getData("nodeId");
          if (draggedNodeId && draggedNodeId !== node.id) {
            handleMoveNode(draggedNodeId, node.id);
          }
        }
      }}
    >
      <div
        className={cn(
          "group flex items-center py-1.5 px-3 rounded-md text-[13px] hover:bg-white/5 border border-transparent hover:border-white/5 transition-all",
          isDragOver && "bg-green-500/10 border-green-500/30",
          level > 0 && "ml-4"
        )}
      >
        <div className="flex items-center flex-1">
          {isFolder && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 hover:bg-white/10 rounded mr-1 text-slate-500 hover:text-white transition-colors"
            >
              {isOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          )}
          
          {!isFolder && <FileText className="w-3.5 h-3.5 mr-2 text-slate-500" />}
          {isFolder && <Folder className="w-3.5 h-3.5 mr-2 text-purple-500/70" />}

          {isFolder ? (
            <span className="font-medium text-slate-300">{node.name}</span>
          ) : (
            <Link 
              href={`/admin/documents/${node.id}`}
              className="font-medium text-slate-300 hover:text-purple-400 transition-colors"
            >
              {node.name}
            </Link>
          )}

          {!isFolder && (
            <span className={cn(
              "ml-3 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider",
              isPublished ? "bg-purple-900/30 text-purple-400" : "bg-zinc-900 text-zinc-600"
            )}>
              {isPublished ? "Público" : "Rascunho"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isFolder && (
            <>
              <button
                onClick={() => setIsAdding({ parentId: node.id, type: "DOCUMENT" })}
                className="p-1 text-slate-500 hover:text-white transition-colors"
                title="Novo Documento"
              >
                <FilePlus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsAdding({ parentId: node.id, type: "FOLDER" })}
                className="p-1 text-slate-500 hover:text-white transition-colors"
                title="Nova Pasta"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <button className="p-1 text-slate-500 hover:text-white transition-colors">
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 text-slate-500 hover:text-red-400 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isAdding && isAdding.parentId === node.id && (
        <div className={cn(
          "flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 my-1",
          level >= 0 && `ml-${(level + 1) * 6}`
        )}
        style={{ marginLeft: `${(level + 1) * 1.5}rem` }}
        >
          <input
            autoFocus
            className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
            placeholder={`Nome do ${isAdding.type === "FOLDER" ? "pasta" : "documento"}`}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddNode(node.id, isAdding.type)}
          />
          <button
            disabled={isLoading}
            onClick={() => handleAddNode(node.id, isAdding.type)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Salvar"}
          </button>
          <button
            onClick={() => setIsAdding(null)}
            className="text-xs font-bold text-slate-400 hover:text-slate-600"
          >
            Cancelar
          </button>
        </div>
      )}

      {isFolder && isOpen && node.children && (
        <div className="mt-1">
          {node.children.map((child) => (
            <AdminTreeItem
              key={child.id}
              node={child}
              collectionSlug={collectionSlug}
              collectionId={collectionId}
              level={level + 1}
              isAdding={isAdding}
              setIsAdding={setIsAdding}
              newName={newName}
              setNewName={setNewName}
              handleAddNode={handleAddNode}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}
