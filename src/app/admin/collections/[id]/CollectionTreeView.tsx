"use client";

import { Node } from "@prisma/client";
import { 
  FileText, 
  Folder, 
  ChevronRight, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  MoreVertical,
  Edit3,
  Trash2,
  FilePlus,
  FolderPlus,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TreeNode extends Node {
  children?: TreeNode[];
}

interface CollectionTreeViewProps {
  tree: TreeNode[];
  collectionId: string;
}

export function CollectionTreeView({ tree, collectionId }: CollectionTreeViewProps) {
  if (tree.length === 0) {
    return (
      <div className="bg-[#050505] border border-border rounded-xl p-12 text-center shadow-2xl">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-zinc-600" />
        </div>
        <h3 className="text-white font-medium mb-1">Nenhum documento ainda</h3>
        <p className="text-zinc-500 text-sm mb-6">Comece criando seu primeiro documento ou pasta no menu lateral.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#050505] border border-border rounded-xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-border/50 bg-white/5 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Estrutura de Conteúdo</span>
        <span className="text-xs text-zinc-500">{tree.length} itens no nível raiz</span>
      </div>
      <div className="divide-y divide-border/50">
        {tree.map((node) => (
          <TreeItem key={node.id} node={node} level={0} collectionId={collectionId} />
        ))}
      </div>
    </div>
  );
}

function TreeItem({ node, level, collectionId }: { node: TreeNode; level: number; collectionId: string }) {
  const [isOpen, setIsOpen] = useState(true);
  const isFolder = node.type === "FOLDER";

  return (
    <div className="flex flex-col">
      <div 
        className={cn(
          "flex items-center justify-between p-4 hover:bg-white/5 transition-colors group",
          level > 0 && "border-l border-border/30 ml-6"
        )}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {isFolder ? (
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              {isOpen ? (
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              )}
            </button>
          ) : (
            <div className="w-6 h-6 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-border" />
            </div>
          )}
          
          <div className="flex items-center gap-3 min-w-0">
            {isFolder ? (
              <Folder className={cn("w-4 h-4 shrink-0", isOpen ? "text-green-500/50" : "text-zinc-500")} />
            ) : (
              <FileText className="w-4 h-4 text-zinc-500 shrink-0" />
            )}
            <div className="flex flex-col min-w-0">
              <Link 
                href={!isFolder ? `/admin/editor/${node.id}` : "#"}
                className={cn(
                  "text-sm font-medium truncate transition-colors",
                  !isFolder ? "text-white hover:text-green-400" : "text-zinc-300"
                )}
                onClick={(e) => isFolder && e.preventDefault()}
              >
                {node.name}
              </Link>
              <span className="text-[10px] text-zinc-600 font-mono">/{node.slug}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            {!node.published && (
              <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 text-[9px] font-bold rounded uppercase tracking-wider border border-amber-500/20">
                Rascunho
              </span>
            )}
            {node.published && (
              <span className="px-1.5 py-0.5 bg-green-500/10 text-green-500 text-[9px] font-bold rounded uppercase tracking-wider border border-green-500/20">
                Publicado
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isFolder && (
            <Link 
              href={`/admin/editor/${node.id}`}
              className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-white/10 transition-all"
              title="Editar"
            >
              <Edit3 className="w-4 h-4" />
            </Link>
          )}
          <div className="w-[1px] h-4 bg-border/50 mx-1" />
          <button className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-white/10 transition-all">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isFolder && isOpen && node.children && node.children.length > 0 && (
        <div className="flex flex-col">
          {node.children.map((child) => (
            <TreeItem key={child.id} node={child} level={level + 1} collectionId={collectionId} />
          ))}
        </div>
      )}

      {isFolder && isOpen && (!node.children || node.children.length === 0) && (
        <div className={cn(
          "py-3 px-12 text-[11px] text-zinc-600 italic border-l border-border/30",
          level > 0 ? "ml-12" : "ml-6"
        )}>
          Pasta vazia
        </div>
      )}
    </div>
  );
}
