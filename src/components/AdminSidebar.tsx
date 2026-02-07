"use client";

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
  Layers
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
    <aside className="w-64 border-r border-border bg-[#050505] flex flex-col h-[calc(100vh-3.5rem)] sticky top-14">
      <div className="p-4 border-b border-border/50">
        <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2 mb-3">
          Administração
        </h2>
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg transition-all group",
                  isActive 
                    ? "bg-green-500/10 text-green-400 font-medium" 
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-green-500" : "text-zinc-600 group-hover:text-green-400"
                )} />
                {item.title}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2 mb-3">
          Categorias
        </h2>
        <div className="space-y-1">
          {collections.map((collection) => {
            const isActive = pathname.startsWith(`/admin/collections/${collection.id}`);
            return (
              <div key={collection.id} className="group/item">
                <Link
                  href={`/admin/collections/${collection.id}`}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-[13px] rounded-lg transition-all",
                    isActive 
                      ? "bg-green-500/10 text-green-400 font-medium" 
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-green-500" : "text-zinc-600 group-hover:text-green-400"
                    )} />
                    <span className="truncate max-w-[120px]">{collection.name}</span>
                  </div>
                  <ChevronRight className={cn(
                    "w-3 h-3 transition-all",
                    isActive ? "text-green-500 translate-x-0.5" : "text-zinc-700 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0.5"
                  )} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-border/50">
        <div className="bg-gradient-to-br from-green-500/5 to-transparent border border-green-500/10 rounded-xl p-3">
          <p className="text-[11px] text-zinc-500 leading-tight">
            Você está no modo <span className="text-green-500 font-bold">Admin</span>. Todas as alterações são salvas automaticamente.
          </p>
        </div>
      </div>
    </aside>
  );
}
