"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Layout, 
  Settings, 
  Plus, 
  BookOpen, 
  ChevronRight,
  Edit3,
  ExternalLink,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  FolderPlus,
  FilePlus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Collection {
  id: string;
  name: string;
  slug: string;
}

interface AdminSidebarProps {
  collections: Collection[];
}

export function AdminSidebar({ collections }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", String(newState));
    // Dispatch a custom event to notify the layout
    window.dispatchEvent(new CustomEvent("sidebar-toggle", { detail: newState }));
  };

  const menuItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: Layout,
    },
    {
      title: "Nova Categoria",
      href: "/admin/collections/new",
      icon: Plus,
    },
  ];

  return (
    <aside 
      className={cn(
        "border-r border-border bg-[#050505] flex flex-col h-[calc(100vh-3.5rem)] sticky top-14 transition-all duration-300 ease-in-out z-40",
        isCollapsed ? "w-[60px]" : "w-64"
      )}
    >
      <div className={cn("p-4 border-b border-border/50 overflow-hidden shrink-0", isCollapsed && "px-3")}>
        {!isCollapsed && (
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2 mb-3 truncate">
            Administração
          </h2>
        )}
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.title : undefined}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg transition-all group",
                  isActive 
                    ? "bg-green-500/10 text-green-400 font-medium" 
                    : "text-zinc-400 hover:text-white hover:bg-white/5",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4 shrink-0 transition-colors",
                  isActive ? "text-green-500" : "text-zinc-600 group-hover:text-green-400"
                )} />
                {!isCollapsed && <span className="truncate">{item.title}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 no-scrollbar overflow-x-hidden">
        {!isCollapsed && (
          <div className="flex items-center justify-between px-2 mb-3">
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Categorias
            </h2>
          </div>
        )}
        <div className="space-y-1">
          {collections.map((collection) => {
            const isActive = pathname.startsWith(`/admin/collections/${collection.id}`);
            return (
              <div key={collection.id} className="group/item">
                <Link
                  href={`/admin/collections/${collection.id}`}
                  title={isCollapsed ? collection.name : undefined}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-[13px] rounded-lg transition-all",
                    isActive 
                      ? "bg-green-500/10 text-green-400 font-medium" 
                      : "text-zinc-400 hover:text-white hover:bg-white/5",
                    isCollapsed && "justify-center px-0"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <BookOpen className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      isActive ? "text-green-500" : "text-zinc-600 group-hover:text-green-400"
                    )} />
                    {!isCollapsed && <span className="truncate">{collection.name}</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronRight className={cn(
                      "w-3 h-3 shrink-0 transition-all",
                      isActive ? "text-green-500 translate-x-0.5" : "text-zinc-700 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0.5"
                    )} />
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar Footer with Collapse Button */}
      <div className="mt-auto p-4 border-t border-border/50 flex flex-col gap-4">
        {!isCollapsed && (
          <div className="bg-gradient-to-br from-green-500/5 to-transparent border border-green-500/10 rounded-xl p-3">
            <p className="text-[11px] text-zinc-500 leading-tight">
              Você está no modo <span className="text-green-500 font-bold">Admin</span>.
            </p>
          </div>
        )}
        
        <button
          onClick={toggleSidebar}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 text-[13px] text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all group",
            isCollapsed && "justify-center px-0"
          )}
          title={isCollapsed ? "Expandir Sidebar" : "Recolher Sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-5 h-5 text-zinc-600 group-hover:text-green-400" />
          ) : (
            <>
              <PanelLeftClose className="w-5 h-5 text-zinc-600 group-hover:text-green-400" />
              <span className="font-medium">Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
