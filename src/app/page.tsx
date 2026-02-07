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
    <div className="max-w-5xl mx-auto px-6 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
          Documentação
        </h1>
        <p className="text-lg text-zinc-400">
          Explore nossos conjuntos de documentação, guias e referências técnicas.
        </p>
      </header>

      {collections.length === 0 ? (
        <div className="bg-[#0A0A0A] border border-dashed border-white/5 rounded-2xl p-12 text-center">
          <Layers className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Nenhuma coleção encontrada
          </h2>
          <p className="text-zinc-500 mb-6">
            Ainda não há documentação pública disponível.
          </p>
          <Link
            href="/admin"
            className="text-green-500 font-medium hover:text-green-400 transition-colors"
          >
            Ir para área administrativa
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/docs/${collection.slug}`}
              className="group bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 hover:border-green-500/30 transition-all shadow-2xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-green-900/10 text-green-500 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-all">
                  <BookOpen className="w-6 h-6" />
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-green-500 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors tracking-tight">
                {collection.name}
              </h3>
              <p className="text-zinc-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                {collection.description || "Sem descrição disponível."}
              </p>
              <div className="flex items-center text-xs text-zinc-600 font-medium">
                <Layers className="w-3.5 h-3.5 mr-1.5" />
                {collection._count.nodes} itens
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
