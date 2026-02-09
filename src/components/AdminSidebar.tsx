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
  FolderPlus,
  FilePlus,
  Loader2,
  Trash2,
  Edit3,
  ExternalLink,
  MoreHorizontal,
  Settings,
  Eye,
  EyeOff,
  LogOut,
  Cloud,
  GripVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers";

import { signOut } from "next-auth/react";
import { IconDisplay } from "./IconDisplay";

interface Node {
  id: string;
  name: string;
  type: "FOLDER" | "PAGE";
  slug: string;
  published: boolean;
  parentId: string | null;
  icon?: string | null;
  children?: Node[];
}

interface Collection {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  nodes: Node[];
}

interface Site {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
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

  const handleCreateSite = async () => {
    const name = prompt("Nome do novo Workspace:");
    if (!name) return;

    try {
      const response = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Erro ao criar workspace:", error);
    }
  };

  const handleCreateCollection = async (siteId: string) => {
    const name = prompt("Nome da nova Coleção:");
    if (!name) return;

    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, siteId }),
      });

      if (response.ok) {
        const newCollection = await response.json();
        router.refresh();
        if (!openSites.includes(siteId)) {
          setOpenSites(prev => [...prev, siteId]);
        }
      }
    } catch (error) {
      console.error("Erro ao criar coleção:", error);
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
        "border-r border-border bg-[#050505] flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out z-40",
        isCollapsed ? "w-[60px]" : "w-72"
      )}
    >
      {/* Logo Area */}
      {!isCollapsed && (
        <div className="p-4 flex items-center gap-2 border-b border-border/50">
          <div className="p-1.5 bg-green-500/10 rounded-lg">
            <Cloud className="w-4 h-4 text-green-500 fill-green-500/20" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[13px] font-bold tracking-tight text-white">cloudstage</span>
            <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest mt-0.5">Admin</span>
          </div>
        </div>
      )}

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
            <SidebarSiteItem
              key={site.id}
              site={site}
              isCollapsed={isCollapsed}
              isOpen={openSites.includes(site.id)}
              onToggle={() => toggleSite(site.id)}
              onAddCollection={handleCreateCollection}
              onAddNode={handleAddNode}
              isCreating={isCreating}
              buildTree={buildTree}
            />
          ))}
        </div>
      </div>

      {/* Footer com Ações */}
      <div className="mt-auto p-4 border-t border-border/50 space-y-2">
        {!isCollapsed && (
          <div className="flex flex-col gap-2 mb-2">
            <div className="flex gap-2">
              <Link 
                href="/admin/sites/new"
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 border border-border/50 rounded-lg text-[12px] text-zinc-400 hover:text-white transition-all group"
              >
                <Plus className="w-3.5 h-3.5 group-hover:text-green-500" />
                Novo Workspace
              </Link>
              <button 
                onClick={() => signOut()}
                className="p-2 bg-white/5 hover:bg-red-500/10 border border-border/50 rounded-lg text-zinc-400 hover:text-red-500 transition-all"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSidebar}
            className={cn(
              "flex-1 flex items-center gap-2.5 px-3 py-2 text-[13px] text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all",
              isCollapsed && "justify-center px-0"
            )}
          >
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); signOut(); }}
                  className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-500 hover:text-red-500 transition-all"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </button>
                <PanelLeftOpen className="w-4 h-4" />
              </div>
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4" />
                <span>Recolher</span>
              </>
            )}
          </button>
          
          {!isCollapsed && (
            <Link
              href="/admin/settings"
              className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              title="Configurações"
            >
              <Settings className="w-4 h-4" />
            </Link>
          )}
        </div>
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = collection.nodes.findIndex((n) => n.id === active.id);
    const newIndex = collection.nodes.findIndex((n) => n.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedNodes = arrayMove(collection.nodes, oldIndex, newIndex);
    
    const items = reorderedNodes.map((node, index) => ({
      id: node.id,
      order: index,
      parentId: node.parentId
    }));

    try {
      const res = await fetch("/api/nodes/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to reorder:", error);
    }
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
          <IconDisplay 
            icon={collection.icon} 
            className="text-[14px] shrink-0 leading-none w-3.5 h-3.5 flex items-center justify-center"
            fallback={<Layers className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-green-500" : "text-zinc-500")} />}
          />
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
                  <Link 
                    href={`/admin/collections/${collection.id}`}
                    onClick={() => setShowMenu(false)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Settings className="w-3 h-3" />
                    Configurações
                  </Link>
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
          >
            <SortableContext
              items={collection.nodes.map(n => n.id)}
              strategy={verticalListSortingStrategy}
            >
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
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}

function SidebarSiteItem({
  site,
  isCollapsed,
  isOpen,
  onToggle,
  onAddCollection,
  onAddNode,
  isCreating,
  buildTree
}: {
  site: Site;
  isCollapsed: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onAddCollection: (siteId: string) => Promise<void>;
  onAddNode: (collectionId: string, type: "FOLDER" | "PAGE", parentId: string | null) => Promise<void>;
  isCreating: string | null;
  buildTree: (nodes: Node[], parentId?: string | null) => Node[];
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(site.name);
  const [isUpdating, setIsUpdating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();

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
    if (!newName.trim() || newName === site.name) {
      setIsRenaming(false);
      setNewName(site.name);
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/sites/${site.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Erro ao renomear workspace:", error);
    } finally {
      setIsUpdating(false);
      setIsRenaming(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja excluir este workspace e tudo o que há nele?")) {
      try {
        const response = await fetch(`/api/sites/${site.id}`, { method: "DELETE" });
        if (response.ok) {
          router.refresh();
        }
      } catch (error) {
        console.error("Erro ao excluir workspace:", error);
      }
    }
    setShowMenu(false);
  };

  return (
    <div className="space-y-1">
      {!isCollapsed && (
        <div className="flex items-center justify-between px-3 py-1.5 group/site">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <IconDisplay 
            icon={site.icon} 
            className="text-[14px] shrink-0 leading-none w-3.5 h-3.5 flex items-center justify-center"
            fallback={<Globe className="w-3 h-3 text-green-500/70 shrink-0" />}
          />
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
                      setNewName(site.name);
                    }
                  }}
                  disabled={isUpdating}
                  className="flex-1 bg-white/10 border border-green-500/50 rounded px-1 py-0.5 text-[11px] font-bold uppercase tracking-widest text-white focus:outline-none disabled:opacity-50"
                  onClick={(e) => e.stopPropagation()}
                />
                {isUpdating && <Loader2 className="w-3 h-3 animate-spin text-green-500" />}
              </div>
            ) : (
              <div className="flex items-center gap-1 flex-1 min-w-0">
                <button
                  onClick={onToggle}
                  className="p-1 hover:bg-white/5 rounded text-zinc-500 hover:text-white transition-colors shrink-0"
                >
                  <ChevronDown className={cn(
                    "w-3 h-3 transition-transform shrink-0",
                    !isOpen && "-rotate-90"
                  )} />
                </button>
                <Link
                  href={`/admin/sites/${site.id}`}
                  className={cn(
                    "flex-1 text-[11px] font-bold uppercase tracking-widest transition-colors truncate",
                    pathname.startsWith(`/admin/sites/${site.id}`) ? "text-green-500" : "text-zinc-500 hover:text-white"
                  )}
                >
                  {site.name}
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover/site:opacity-100 transition-opacity">
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 text-zinc-500 hover:text-white transition-all rounded hover:bg-white/5"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>

              {showMenu && (
                <div 
                  ref={menuRef}
                  className="absolute right-0 top-full mt-1 w-40 bg-[#0F0F0F] border border-border/50 rounded-lg shadow-xl z-50 py-1 overflow-hidden"
                >
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddCollection(site.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Layers className="w-3 h-3" />
                    Nova Coleção
                  </button>
                  <Link 
                    href={`/admin/sites/${site.id}`}
                    onClick={() => setShowMenu(false)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Settings className="w-3 h-3" />
                    Configurações
                  </Link>
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
        </div>
      )}
      
      {/* Collections & Spaces */}
      {(isOpen || isCollapsed) && (
        <div className="space-y-0.5">
          {site.collections.map((collection) => {
            const isActive = pathname.startsWith(`/admin/collections/${collection.id}`);

            return (
              <SidebarCollectionItem 
                key={collection.id}
                collection={collection}
                isActive={isActive}
                isCollapsed={isCollapsed}
                onAddNode={onAddNode}
                isCreating={isCreating === collection.id}
                buildTree={buildTree}
              />
            );
          })}
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isOpen, setIsOpen] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(node.name);
  const [showIconPicker, setShowIconPicker] = useState(false);
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

  const handleTogglePublish = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/nodes/${node.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !node.published }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Erro ao alternar publicação:", error);
    } finally {
      setIsUpdating(false);
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

  const handleUpdateIcon = async (icon: string) => {
    try {
      const res = await fetch(`/api/nodes/${node.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ icon }),
      });
      if (res.ok) router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="space-y-0.5"
    >
      <div 
        className={cn(
          "group flex items-center py-1 px-2 rounded-md text-[13px] transition-all cursor-pointer relative",
          isActive ? "bg-green-500/10 text-green-400" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5",
          isDragging && "opacity-50 z-50 bg-white/5"
        )}
      >
        <div 
          {...attributes} 
          {...listeners}
          className="p-1 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-zinc-600 hover:text-white transition-all mr-1"
        >
          <GripVertical className="w-3 h-3" />
        </div>

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
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowIconPicker(true);
            }}
            className="flex items-center justify-center p-0.5 hover:bg-white/10 rounded mr-1.5 transition-all"
          >
            <IconDisplay 
              icon={node.icon} 
              className="text-[14px] leading-none" 
              fallback={
                !isFolder ? (
                  <FileText className={cn("w-3.5 h-3.5", isActive ? "text-green-500" : "text-zinc-600")} />
                ) : (
                  <Folder className={cn("w-3.5 h-3.5", isOpen ? "text-green-500/40" : "text-zinc-600")} />
                )
              }
            />
          </button>

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
                      handleTogglePublish();
                      setShowMenu(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-1.5 text-[11px] transition-colors",
                      node.published 
                        ? "text-amber-500/70 hover:text-amber-400 hover:bg-amber-500/5" 
                        : "text-green-500/70 hover:text-green-400 hover:bg-green-500/5"
                    )}
                  >
                    {node.published ? (
                      <>
                        <EyeOff className="w-3 h-3" />
                        Despublicar
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" />
                        Publicar
                      </>
                    )}
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

      {showIconPicker && (
        <IconPicker
          currentIcon={node.icon}
          onSelect={handleUpdateIcon}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </div>
  );
}
