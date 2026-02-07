import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookOpen, ChevronRight, Layers } from "lucide-react";

export default async function Home() {
  let collections = [];
  try {
    collections = await prisma.collection.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { nodes: true },
        },
      },
    });
  } catch (error) {
    console.error("Erro ao carregar coleções:", error);
  }

  return (
    <div className={`min-h-[calc(100vh-3.5rem)] relative overflow-hidden ${collections.length === 0 ? 'bg-[#050505]' : 'bg-black'}`}>
      {/* Background Image for Empty State */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070" 
          alt="Mountain Background" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
      </div>

      <div className={`max-w-5xl mx-auto px-6 py-12 w-full z-10 relative`}>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
          {collections.length > 0 ? (
            <div className="space-y-4">
              <h1 className="text-5xl font-extrabold text-white tracking-tighter">
                Explore a <span className="text-green-500">Documentação</span>
              </h1>
              <p className="text-zinc-400 text-lg max-w-2xl">
                Selecione um dos módulos acima na barra de navegação para começar.
              </p>
            </div>
          ) : (
            /* Empty state placeholder */
            <div className="min-h-[60vh]"></div>
          )}
        </div>
      </div>
    </div>
  );
}
