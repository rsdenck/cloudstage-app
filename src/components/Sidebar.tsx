"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, FileText, Folder, Layout } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Node {
  id: string;
  name: string;
  slug: string;
  type: "FOLDER" | "DOCUMENT";
  children?: Node[];
}

interface SidebarProps {
  tree: Node[];
  collectionSlug: string;
  isAdmin?: boolean;
}

export function Sidebar({ tree, collectionSlug, isAdmin = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-sidebar h-[calc(100vh-56px)] overflow-y-auto flex flex-col sticky top-14">
      <div className="flex-1 p-3 space-y-1">
        {tree.map((node) => (
          <SidebarItem
            key={node.id}
            node={node}
            collectionSlug={collectionSlug}
            pathname={pathname}
            isAdmin={isAdmin}
            level={0}
          />
        ))}
      </div>

      <div className="p-4 border-t border-border mt-auto">
        <div className="bg-white/5 rounded-lg p-3 text-[11px] text-slate-400">
          <p className="font-medium text-slate-300">cloudstage</p>
        </div>
      </div>
    </aside>
  );
}

function SidebarItem({
  node,
  collectionSlug,
  pathname,
  isAdmin,
  level,
}: {
  node: Node;
  collectionSlug: string;
  pathname: string;
  isAdmin: boolean;
  level: number;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const isFolder = node.type === "FOLDER";
  
  const href = isAdmin 
    ? `/admin/collections/${collectionSlug}/nodes/${node.id}`
    : `/docs/${collectionSlug}/${node.slug}`;

  const isActive = pathname === href;

  return (
    <div>
      <div
        className={cn(
          "group flex items-center py-1.5 px-2 rounded-lg text-[13px] cursor-pointer transition-all",
          isActive 
            ? "bg-green-500/10 text-green-400 font-medium" 
            : "text-slate-400 hover:text-white hover:bg-white/5",
          level > 0 && "ml-4"
        )}
      >
        {isFolder && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-white/10 rounded mr-1 transition-colors"
          >
            {isOpen ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        )}
        
        {!isFolder && (
          <FileText className={cn(
            "w-3.5 h-3.5 mr-2",
            isActive ? "text-green-400" : "text-slate-500 group-hover:text-slate-300"
          )} />
        )}
        {isFolder && (
          <Folder className={cn(
            "w-3.5 h-3.5 mr-2",
            isActive ? "text-blue-400" : "text-blue-500/70 group-hover:text-blue-400"
          )} />
        )}

        <Link href={href} className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
          {node.name}
        </Link>
      </div>

      {isFolder && isOpen && node.children && (
        <div className="mt-1">
          {node.children.map((child) => (
            <SidebarItem
              key={child.id}
              node={child}
              collectionSlug={collectionSlug}
              pathname={pathname}
              isAdmin={isAdmin}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
