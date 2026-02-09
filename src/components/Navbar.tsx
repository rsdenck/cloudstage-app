"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { 
  LogOut, 
  Settings, 
  Search, 
  Home, 
  ChevronDown,
  Layout,
  Cloud,
  ExternalLink,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Collection {
  id: string;
  name: string;
  slug: string;
}

interface NavbarProps {
  collections: Collection[];
}

export function Navbar({ collections }: NavbarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <nav className="h-14 border-b border-border bg-navbar flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
        <Link href={isAdminPage ? "/admin" : "/"} className="flex items-center gap-2 shrink-0 group">
          <div className="p-1.5 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-all">
            <Cloud className="w-5 h-5 text-green-500 fill-green-500/20" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-tight text-white group-hover:text-green-400 transition-colors">cloudstage</span>
            {isAdminPage && (
              <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest mt-0.5">Admin</span>
            )}
          </div>
        </Link>

        {/* Links Públicos - Apenas visíveis quando não estamos no admin */}
        {!isAdminPage && (
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-[13px] rounded-md transition-all whitespace-nowrap group",
                pathname === "/" ? "bg-white/5 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Home className={cn("w-4 h-4", pathname === "/" ? "text-green-400" : "text-slate-500 group-hover:text-green-400")} />
              <span>Home</span>
            </Link>

            {collections.map((item) => (
              <Link
                key={item.id}
                href={`/docs/${item.slug}`}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-md transition-all whitespace-nowrap group",
                  pathname.startsWith(`/docs/${item.slug}`) ? "bg-white/5 text-green-400" : "text-slate-400 hover:text-green-400"
                )}
              >
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Barra de Pesquisa - Apenas no Público */}
        {!isAdminPage && (
          <div className="relative hidden md:block group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Pesquisar documentação..." 
              className="bg-white/5 border border-border rounded-lg pl-10 pr-4 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 border border-border rounded px-1 group-focus-within:hidden">
              Ctrl K
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 ml-2 pl-4 border-l border-border">
          {session ? (
            <>
              {!isAdminPage ? (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg text-xs font-bold transition-all border border-green-500/20"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Painel Admin
                </Link>
              ) : (
                <Link
                  href="/"
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg text-xs font-bold transition-all border border-white/10"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Ver Site Público
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="p-2 hover:bg-red-500/10 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <Link
              href="/admin/login"
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg text-xs font-bold transition-all border border-white/10"
            >
              <Settings className="w-3.5 h-3.5" />
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
