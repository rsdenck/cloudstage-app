"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Plus, 
  ChevronRight,
  ChevronDown,
  Globe,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  Folder,
  FileText,
  MoreVertical,
  Search,
  PlusCircle,
  FolderPlus,
  FilePlus,
  Loader2,
  Trash2,
  Edit3,
  ExternalLink,
  MoreHorizontal,
  Settings
} from "lucide-react";
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

interface Collection {
  id: string;
  name: string;
  slug: string;
  nodes: Node[];
}

interface Site {
  id: string;
  name: string;
  slug: string;
  collections: Collection[];
}

interface AdminSidebarProps {
  sites: Site[];
}

export function AdminSidebar({ sites }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSites, setOpenSites] = useState<string[]>(sites.map(s => s.id));
  const [openCollections, setOpenCollections] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState<string | null>(null); // collectionId or nodeId
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    if (saved) setIsCollapsed(saved === "true");
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("admin-sidebar-collapsed", String(newState));
  };

  const toggleSite = (siteId: string) => {
    setOpenSites(prev => 
      prev.includes(siteId) ? prev.filter(id => id !== siteId) : [...prev, siteId]
    );
  };

  const toggleCollection = (collectionId: string) => {
    setOpenCollections(prev => 
      prev.includes(collectionId) ? prev.filter(id => id !== collectionId) : [...prev, collectionId]
    );
  };

  const handleAddNode = async (collectionId: string, type: "FOLDER" | "PAGE", parentId: string | null = null) => {
    setIsCreating(parentId || collectionId);
    try {
      const response = await fetch("/api/nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: type === "FOLDER" ? "Nova Pasta" : "Novo Documento",
          type: type === "FOLDER" ? "FOLDER" : "PAGE",
          collectionId,
          parentId,
        }),
      });

      if (response.ok) {
        const newNode = await response.json();
        router.refresh();
        if (newNode.type === "PAGE") {
          router.push(`/admin/editor/${newNode.id}`);
        }
        if (!openCollections.includes(collectionId)) {
          setOpenCollections(prev => [...prev, collectionId]);
        }
      }
    } catch (error) {
      console.error("Erro ao criar node:", error);
    } finally {
      setIsCreating(null);
    }
  };

  // Build recursive tree from flat nodes
  const buildTree = (nodes: Node[], parentId: string | null = null): Node[] => {
    return nodes
      .filter(node => node.parentId === parentId)
      .map(node => ({
        ...node,
        children: buildTree(nodes, node.id)
      }));
  };

  return (
    <aside 
      className={cn(
        "border-r border-border bg-[#050505] flex flex-col h-[calc(100vh-3.5rem)] sticky top-14 transition-all duration-300 ease-in-out z-40",
        isCollapsed ? "w-[60px]" : "w-72"
      )}
    >
      {/* Header com Busca */}
      <div className={cn("p-4 border-b border-border/50 shrink-0", isCollapsed && "px-3")}>
        {!isCollapsed ? (
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 group-focus-within:text-green-500 transition-colors" />
            <input 
              type="text"
              placeholder="Pesquisar..."
              className="w-full bg-white/5 border border-border/50 rounded-lg py-1.5 pl-9 pr-3 text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        ) : (
          <button className="w-full flex justify-center p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-all">
            <Search className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navegação Principal */}
      <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
        <div className="space-y-4">
          {sites.map((site) => (
            <div key={site.id} className="space-y-1">
              {/* Site Header */}
              {!isCollapsed && (
                <div className="flex items-center justify-between px-3 py-1.5 group/site">
                  <button
                    onClick={() => toggleSite(site.id)}
                    className="flex items-center gap-2 text-[11px] font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
                  >
                    <Globe className="w-3 h-3 text-green-500/70" />
                    <span className="truncate">{site.name}</span>
                    <ChevronDown className={cn(
                      "w-3 h-3 transition-transform",
                      !openSites.includes(site.id) && "-rotate-90"
                    )} />
                  </button>
                  <button className="opacity-0 group-hover/site:opacity-100 p-1 text-zinc-500 hover:text-white transition-all">
                    <PlusCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              
              {/* Collections & Spaces */}
              {(openSites.includes(site.id) || isCollapsed) && (
                <div className="space-y-0.5">
                  {site.collections.map((collection) => {
                    const tree = buildTree(collection.nodes);
                    const isOpen = openCollections.includes(collection.id);
                    const isActive = pathname.startsWith(`/admin/collections/${collection.id}`);

                    return (
                      <SidebarCollectionItem 
                        key={collection.id}
                        collection={collection}
                        isActive={isActive}
                        isCollapsed={isCollapsed}
                        onAddNode={handleAddNode}
                        isCreating={isCreating === collection.id}
                        buildTree={buildTree}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer com Ações */}
      <div className="mt-auto p-4 border-t border-border/50 space-y-2">
        {!isCollapsed && (
          <div className="flex gap-2 mb-2">
            <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 border border-border/50 rounded-lg text-[12px] text-zinc-400 hover:text-white transition-all group">
              <Layers className="w-3.5 h-3.5 group-hover:text-green-500" />
              Nova Coleção
            </button>
            <button className="p-2 bg-white/5 hover:bg-white/10 border border-border/50 rounded-lg text-zinc-400 hover:text-white transition-all">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all",
            isCollapsed && "justify-center px-0"
          )}
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : (
            <>
              <PanelLeftClose className="w-4 h-4" />
              <span>Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

function SidebarCollectionItem({
  collection,
  isActive,
  isCollapsed,
  onAddNode,
  isCreating,
  buildTree
}: {
  collection: Collection;
  isActive: boolean;
  isCollapsed: boolean;
  onAddNode: (collectionId: string, type: "FOLDER" | "PAGE", parentId: string | null) => Promise<void>;
  isCreating: boolean;
  buildTree: (nodes: Node[], parentId?: string | null) => Node[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(collection.name);
  const [isUpdating, setIsUpdating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as any)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRename = async () => {
    if (!newName.trim() || newName === collection.name) {
      setIsRenaming(false);
      setNewName(collection.name);
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/collections/${collection.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Erro ao renomear coleção:", error);
    } finally {
      setIsUpdating(false);
      setIsRenaming(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja excluir esta coleção e todos os seus documentos?")) {
      try {
        const response = await fetch(`/api/collections/${collection.id}`, { method: "DELETE" });
        if (response.ok) {
          router.refresh();
          router.push("/admin");
        }
      } catch (error) {
        console.error("Erro ao excluir coleção:", error);
      }
    }
    setShowMenu(false);
  };

  const tree = buildTree(collection.nodes);

  return (
    <div className="space-y-0.5">
      <div 
        className={cn(
          "group flex items-center justify-between px-3 py-1.5 rounded-lg transition-all cursor-pointer",
          isActive ? "bg-green-500/10 text-green-400" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Layers className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-green-500" : "text-zinc-500")} />
          {!isCollapsed && (
            isRenaming ? (
              <div className="flex-1 flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename();
                    if (e.key === "Escape") {
                      setIsRenaming(false);
                      setNewName(collection.name);
                    }
                  }}
                  disabled={isUpdating}
                  className="flex-1 bg-white/10 border border-green-500/50 rounded px-1 py-0.5 text-[13px] text-white focus:outline-none disabled:opacity-50"
                  onClick={(e) => e.stopPropagation()}
                />
                {isUpdating && <Loader2 className="w-3 h-3 animate-spin text-green-500" />}
              </div>
            ) : (
              <span className="text-[13px] font-medium truncate">{collection.name}</span>
            )
          )}
        </div>
        {!isCollapsed && !isRenaming && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onAddNode(collection.id, "PAGE");
              }}
              disabled={isCreating}
              className="p-1 text-zinc-500 hover:text-white rounded hover:bg-white/10 disabled:opacity-50"
            >
              {isCreating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
            </button>
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 text-zinc-500 hover:text-white rounded hover:bg-white/10"
              >
                <MoreVertical className="w-3 h-3" />
              </button>

              {showMenu && (
                <div 
                  ref={menuRef}
                  className="absolute right-0 top-full mt-1 w-40 bg-[#0F0F0F] border border-border/50 rounded-lg shadow-xl z-50 py-1 overflow-hidden"
                >
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddNode(collection.id, "FOLDER");
                      setShowMenu(false);
                      setIsOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <FolderPlus className="w-3 h-3" />
                    Nova Pasta
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddNode(collection.id, "PAGE");
                      setShowMenu(false);
                      setIsOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <FilePlus className="w-3 h-3" />
                    Novo Documento
                  </button>
                  <div className="h-[1px] bg-border/30 my-1" />
                  <button 
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setIsRenaming(true);
                      setShowMenu(false); 
                    }}
                  >
                    <Edit3 className="w-3 h-3" />
                    Renomear
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-red-500/70 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Excluir
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tree Nodes inside Collection */}
      {isOpen && !isCollapsed && (
        <div className="ml-4 pl-2 border-l border-border/30 space-y-0.5 mt-0.5 mb-2">
          {tree.length > 0 ? (
            tree.map(node => (
              <SidebarTreeItem 
                key={node.id} 
                node={node} 
                collectionId={collection.id}
                level={0}
                onAddNode={onAddNode}
                isCreating={isCreating}
              />
            ))
          ) : (
            <div className="py-2 px-2 text-[11px] text-zinc-600 italic">
              Nenhum documento ainda
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SidebarTreeItem({ 
  node, 
  collectionId, 
  level, 
  onAddNode,
  isCreating 
}: { 
  node: Node, 
  collectionId: string, 
  level: number,
  onAddNode: (collectionId: string, type: "FOLDER" | "PAGE", parentId: string | null) => Promise<void>,
  isCreating: boolean
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(node.name);
  const [isUpdating, setIsUpdating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const isFolder = node.type === "FOLDER";
  const isActive = pathname === `/admin/editor/${node.id}`;

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as any)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRename = async () => {
    if (!newName.trim() || newName === node.name) {
      setIsRenaming(false);
      setNewName(node.name);
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/nodes/${node.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Erro ao renomear node:", error);
    } finally {
      setIsUpdating(false);
      setIsRenaming(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      try {
        const response = await fetch(`/api/nodes/${node.id}`, { method: "DELETE" });
        if (response.ok) {
          router.refresh();
          if (isActive) {
            router.push("/admin");
          }
        }
      } catch (error) {
        console.error("Erro ao excluir node:", error);
      }
    }
    setShowMenu(false);
  };

  return (
    <div className="space-y-0.5">
      <div 
        className={cn(
          "group flex items-center py-1 px-2 rounded-md text-[13px] transition-all cursor-pointer relative",
          isActive ? "bg-green-500/10 text-green-400" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
        )}
      >
        <div className="flex items-center flex-1 min-w-0">
          {isFolder && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className="p-0.5 hover:bg-white/10 rounded mr-1 text-zinc-600 hover:text-white transition-colors"
            >
              {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          )}
          
          {!isFolder ? (
            <FileText className={cn("w-3.5 h-3.5 mr-2", isActive ? "text-green-500" : "text-zinc-600")} />
          ) : (
            <Folder className={cn("w-3.5 h-3.5 mr-2", isOpen ? "text-green-500/40" : "text-zinc-600")} />
          )}

          {isRenaming ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename();
                  if (e.key === "Escape") {
                    setIsRenaming(false);
                    setNewName(node.name);
                  }
                }}
                disabled={isUpdating}
                className="flex-1 bg-white/10 border border-green-500/50 rounded px-1 py-0.5 text-[13px] text-white focus:outline-none disabled:opacity-50"
                onClick={(e) => e.stopPropagation()}
              />
              {isUpdating && <Loader2 className="w-3 h-3 animate-spin text-green-500" />}
            </div>
          ) : (
            <Link 
              href={isFolder ? "#" : `/admin/editor/${node.id}`}
              className="flex-1 truncate py-0.5"
              onClick={(e) => {
                if (isFolder) {
                  e.preventDefault();
                  setIsOpen(!isOpen);
                }
              }}
            >
              {node.name}
            </Link>
          )}

          <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {isFolder && !isRenaming && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onAddNode(collectionId, "PAGE", node.id);
                }}
                disabled={isCreating}
                className="p-0.5 text-zinc-600 hover:text-white rounded hover:bg-white/10"
              >
                {isCreating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
              </button>
            )}
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-0.5 text-zinc-600 hover:text-white rounded hover:bg-white/10"
              >
                <MoreHorizontal className="w-3 h-3" />
              </button>

              {showMenu && (
                <div 
                  ref={menuRef}
                  className="absolute right-0 top-full mt-1 w-36 bg-[#0F0F0F] border border-border/50 rounded-lg shadow-xl z-50 py-1 overflow-hidden"
                >
                  {isFolder && (
                    <>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddNode(collectionId, "FOLDER", node.id);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <FolderPlus className="w-3 h-3" />
                        Nova Pasta
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddNode(collectionId, "PAGE", node.id);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <FilePlus className="w-3 h-3" />
                        Novo Documento
                      </button>
                      <div className="h-[1px] bg-border/30 my-1" />
                    </>
                  )}
                  <button 
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setIsRenaming(true);
                      setShowMenu(false); 
                    }}
                  >
                    <Edit3 className="w-3 h-3" />
                    Renomear
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-red-500/70 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Excluir
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isFolder && isOpen && node.children && node.children.length > 0 && (
        <div className="ml-3 pl-1 border-l border-border/20 space-y-0.5">
          {node.children.map(child => (
            <SidebarTreeItem 
              key={child.id} 
              node={child} 
              collectionId={collectionId}
              level={level + 1}
              onAddNode={onAddNode}
              isCreating={isCreating}
            />
          ))}
        </div>
      )}
    </div>
  );
}
