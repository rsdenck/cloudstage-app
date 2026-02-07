import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookOpen, ChevronRight, Layers } from "lucide-react";

export default async function Home() {
  const collections = await prisma.collection.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { nodes: true },
      },
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
          Documentação
        </h1>
        <p className="text-lg text-slate-600">
          Explore nossos conjuntos de documentação, guias e referências técnicas.
        </p>
      </header>

      {collections.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-12 text-center">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-700 mb-2">
            Nenhuma coleção encontrada
          </h2>
          <p className="text-slate-500 mb-6">
            Ainda não há documentação pública disponível.
          </p>
          <Link
            href="/admin"
            className="text-blue-600 font-medium hover:underline"
          >
            Ir para área administrativa
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/docs/${collection.slug}`}
              className="group bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <BookOpen className="w-6 h-6" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                {collection.name}
              </h3>
              <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                {collection.description || "Sem descrição disponível."}
              </p>
              <div className="flex items-center text-xs text-slate-400 font-medium">
                <Layers className="w-3 h-3 mr-1" />
                {collection._count.nodes} itens
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
