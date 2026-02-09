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
  ChevronDown,
  Globe,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  Folder,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Node {
  id: string;
  name: string;
  type: "FOLDER" | "PAGE";
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
  const pathname = usePathname();

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

  return (
    <aside 
      className={cn(
        "border-r border-border bg-[#050505] flex flex-col h-[calc(100vh-3.5rem)] sticky top-14 transition-all duration-300 ease-in-out z-40",
        isCollapsed ? "w-[60px]" : "w-64"
      )}
    >
      <div className={cn("p-4 border-b border-border/50 shrink-0", isCollapsed && "px-3")}>
        <div className="space-y-1">
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg transition-all group",
              pathname === "/admin" ? "bg-green-500/10 text-green-400 font-medium" : "text-zinc-400 hover:text-white hover:bg-white/5",
              isCollapsed && "justify-center px-0"
            )}
          >
            <Layout className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Dashboard</span>}
          </Link>
          <Link
            href="/admin/sites/new"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all group",
              isCollapsed && "justify-center px-0"
            )}
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Novo Site</span>}
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
        {!isCollapsed && (
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-4 mb-3">
            Seus Sites
          </h2>
        )}
        
        <div className="space-y-4">
          {sites.map((site) => (
            <div key={site.id} className="space-y-1">
              {!isCollapsed && (
                <button
                  onClick={() => toggleSite(site.id)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-green-500/70" />
                    <span className="truncate">{site.name}</span>
                  </div>
                  <ChevronDown className={cn(
                    "w-3 h-3 transition-transform",
                    !openSites.includes(site.id) && "-rotate-90"
                  )} />
                </button>
              )}
              
              {(openSites.includes(site.id) || isCollapsed) && (
                <div className="space-y-0.5">
                  {site.collections.map((collection) => (
                    <div key={collection.id} className="space-y-0.5">
                      <Link
                        href={`/admin/collections/${collection.id}`}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-1.5 text-[13px] rounded-lg transition-all",
                          pathname.startsWith(`/admin/collections/${collection.id}`) 
                            ? "bg-green-500/10 text-green-400 font-medium" 
                            : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5",
                          isCollapsed && "justify-center px-0"
                        )}
                      >
                        <Layers className="w-3.5 h-3.5 shrink-0" />
                        {!isCollapsed && <span className="truncate">{collection.name}</span>}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-border/50">
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
