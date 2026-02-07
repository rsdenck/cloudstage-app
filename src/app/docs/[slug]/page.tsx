import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Cloud, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  let collection = null;
  try {
    collection = await prisma.collection.findUnique({
      where: { slug },
      include: {
        nodes: {
          where: {
            type: "DOCUMENT",
            document: {
              status: "PUBLISHED"
            }
          },
          take: 1,
          orderBy: { position: "asc" }
        }
      }
    });
  } catch (error) {
    console.error("Erro ao carregar coleção:", error);
    // collection permanece null, cairá no notFound()
  }

  if (!collection) notFound();

  return (
    <div className="max-w-4xl mx-auto px-8 py-20">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-green-500/10 rounded-2xl">
          <Cloud className="w-8 h-8 text-green-500" />
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">{collection.name}</h1>
      </div>
      
      <div className="mb-12">
        <p className="text-xl text-slate-400 leading-relaxed">
          {collection.description || "Bem-vindo a esta coleção de documentos. Use a barra lateral para navegar pelos conteúdos."}
        </p>
      </div>

      {collection.nodes.length > 0 && (
        <Link
          href={`/docs/${slug}/${collection.nodes[0].slug}`}
          className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-500 transition-all shadow-xl shadow-green-900/20 active:scale-[0.98]"
        >
          Começar a ler
          <ChevronRight className="w-5 h-5" />
        </Link>
      )}
    </div>
  );
}
