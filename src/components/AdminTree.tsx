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
  Loader2,
  GripVertical
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Node {
  id: string;
  name: string;
  type: "FOLDER" | "PAGE";
  slug: string;
  published: boolean;
  parentId: string | null;
  children?: Node[];
}

interface AdminTreeProps {
  tree: Node[];
  collectionId: string;
  collectionSlug: string;
}

export function AdminTree({ tree, collectionId, collectionSlug }: AdminTreeProps) {
  const [isAdding, setIsAdding] = useState<{ parentId: string | null; type: "FOLDER" | "PAGE" } | null>(null);
  const [newName, setNewName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAddNode = async (parentId: string | null, type: "FOLDER" | "PAGE") => {
    if (!newName.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          type,
          parentId,
          collectionId,
        }),
      });
      if (res.ok) {
        setNewName("");
        setIsAdding(null);
        router.refresh();
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
      await fetch(`/api/nodes/${nodeId}/move`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId: newParentId }),
      });
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setIsAdding({ parentId: null, type: "FOLDER" })}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-all"
        >
          <FolderPlus className="w-3.5 h-3.5 text-purple-500" />
          Nova Pasta
        </button>
        <button
          onClick={() => setIsAdding({ parentId: null, type: "PAGE" })}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-all"
        >
          <FilePlus className="w-3.5 h-3.5 text-green-500" />
          Nova Página
        </button>
      </div>

      {isAdding && isAdding.parentId === null && (
        <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-green-500/30 mb-4 animate-in fade-in slide-in-from-top-2">
          <input
            autoFocus
            className="flex-1 bg-transparent border-none text-sm text-white focus:ring-0 placeholder:text-zinc-600"
            placeholder={`Nome do ${isAdding.type === "FOLDER" ? "pasta" : "documento"}`}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddNode(null, isAdding.type)}
          />
          <button
            onClick={() => handleAddNode(null, isAdding.type)}
            disabled={isLoading}
            className="p-1.5 bg-green-500 text-black rounded hover:bg-green-400 transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
          </button>
          <button
            onClick={() => setIsAdding(null)}
            className="text-[12px] text-zinc-500 hover:text-zinc-400 px-2"
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
        {tree.length === 0 && !isAdding && (
          <div className="text-center py-12 border border-dashed border-white/5 rounded-xl">
            <p className="text-sm text-zinc-600 italic">Esta coleção ainda não possui documentos.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminTreeItem({ 
  node, 
  collectionId, 
  collectionSlug, 
  level, 
  isAdding, 
  setIsAdding, 
  newName, 
  setNewName, 
  handleAddNode, 
  handleMoveNode,
  isLoading 
}: any) {
  const [isOpen, setIsOpen] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const isFolder = node.type === "FOLDER";

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
          const nodeId = e.dataTransfer.getData("nodeId");
          if (nodeId && nodeId !== node.id) {
            handleMoveNode(nodeId, node.id);
          }
        }
      }}
    >
      <div
        className={cn(
          "group flex items-center py-1.5 px-3 rounded-lg text-[13px] transition-all border border-transparent",
          isDragOver ? "bg-green-500/10 border-green-500/30" : "hover:bg-white/5",
          level > 0 && "ml-4"
        )}
      >
        <GripVertical className="w-3.5 h-3.5 text-zinc-800 group-hover:text-zinc-600 mr-2 cursor-grab active:cursor-grabbing" />
        
        <div className="flex items-center flex-1 min-w-0">
          {isFolder && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 hover:bg-white/10 rounded mr-1 text-zinc-500 hover:text-white transition-colors"
            >
              {isOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          )}
          
          {!isFolder ? (
            <FileText className="w-3.5 h-3.5 mr-2 text-zinc-500" />
          ) : (
            <Folder className="w-3.5 h-3.5 mr-2 text-green-500/50" />
          )}

          {isFolder ? (
            <span className="font-medium text-zinc-300 truncate">{node.name}</span>
          ) : (
            <Link 
              href={`/admin/documents/${node.id}`}
              className="font-medium text-zinc-300 hover:text-green-400 transition-colors truncate"
            >
              {node.name}
            </Link>
          )}

          <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isFolder && (
              <>
                <button
                  onClick={() => setIsAdding({ parentId: node.id, type: "PAGE" })}
                  title="Nova Página"
                  className="p-1 text-zinc-500 hover:text-green-500 hover:bg-green-500/10 rounded transition-all"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsAdding({ parentId: node.id, type: "FOLDER" })}
                  title="Nova Pasta"
                  className="p-1 text-zinc-500 hover:text-purple-500 hover:bg-purple-500/10 rounded transition-all"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            <button className="p-1 text-zinc-500 hover:text-white hover:bg-white/10 rounded transition-all">
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {isAdding && isAdding.parentId === node.id && (
        <div className={cn(
          "flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-green-500/30 my-1 animate-in fade-in slide-in-from-top-2",
          level > 0 ? "ml-8" : "ml-4"
        )}>
          <input
            autoFocus
            className="flex-1 bg-transparent border-none text-sm text-white focus:ring-0 placeholder:text-zinc-600"
            placeholder={`Nome do ${isAdding.type === "FOLDER" ? "pasta" : "documento"}`}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddNode(node.id, isAdding.type)}
          />
          <button
            disabled={isLoading}
            onClick={() => handleAddNode(node.id, isAdding.type)}
            className="p-1.5 bg-green-500 text-black rounded hover:bg-green-400 transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
          </button>
          <button
            onClick={() => setIsAdding(null)}
            className="text-[12px] text-zinc-500 hover:text-zinc-400 px-2"
          >
            Cancelar
          </button>
        </div>
      )}

      {isFolder && isOpen && node.children && (
        <div className="mt-0.5">
          {node.children.map((child: any) => (
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
              handleMoveNode={handleMoveNode}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}
