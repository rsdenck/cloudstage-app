"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { 
  LogOut, 
  Settings, 
  Search, 
  Home, 
  ChevronDown,
  Layout,
  Cloud
} from "lucide-react";

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

  return (
    <nav className="h-14 border-b border-border bg-navbar flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg shrink-0">
          <div className="p-1.5 bg-green-500/10 rounded-lg">
            <Cloud className="w-5 h-5 text-green-500" />
          </div>
          <span className="text-md font-bold tracking-tight text-white">cloudstage</span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-all whitespace-nowrap group"
          >
            <Home className="w-4 h-4 text-slate-500 group-hover:text-green-400" />
            <span>Home</span>
          </Link>

          {collections.map((item) => (
            <Link
              key={item.id}
              href={`/docs/${item.slug}`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-all whitespace-nowrap group"
            >
              <Layout className="w-4 h-4 text-slate-500 group-hover:text-green-400" />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-white/5 border border-border rounded-lg pl-10 pr-4 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 border border-border rounded px-1 group-focus-within:hidden">
            Ctrl K
          </div>
        </div>

        {session ? (
          <div className="flex items-center gap-2 ml-2 pl-4 border-l border-border">
            <Link
              href="/admin"
              className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors"
              title="Admin"
            >
              <Settings className="w-4 h-4" />
            </Link>
            <button
              onClick={() => signOut()}
              className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/admin/login"
            className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors"
            title="Login Admin"
          >
            <Settings className="w-4 h-4" />
          </Link>
        )}
      </div>
    </nav>
  );
}
