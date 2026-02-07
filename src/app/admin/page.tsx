import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Settings, BookOpen, Trash2, Edit3, ExternalLink } from "lucide-react";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  let collections = [];
  try {
    collections = await prisma.collection.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { nodes: true },
        },
      },
    });
  } catch (error) {
    console.error("Erro ao buscar coleções:", error);
    // collections continua como array vazio
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Gerenciar Categorias</h1>
          <p className="text-zinc-500 text-sm">Controle em qual domínio sua documentação será publicada.</p>
        </div>
        <Link
          href="/admin/collections/new"
          className="bg-gradient-to-r from-green-900 to-black text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-green-900/10 border border-green-500/20"
        >
          <Plus className="w-4 h-4" />
          Nova Categoria
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {collections.length === 0 ? (
          <div className="bg-black border border-white/5 border-dashed rounded-xl p-12 text-center">
            <BookOpen className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-1">Sem categorias</h3>
            <p className="text-zinc-500 mb-6 text-sm">Comece criando sua primeira categoria de documentos.</p>
            <Link
              href="/admin/collections/new"
              className="text-green-500 font-semibold hover:text-green-400 transition-colors text-sm"
            >
              Criar agora
            </Link>
          </div>
        ) : (
          collections.map((collection) => (
            <div
              key={collection.id}
              className="bg-[#0A0A0A] border border-white/5 rounded-xl p-5 flex items-center justify-between hover:border-green-500/30 transition-all shadow-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-green-900/20 text-green-500 rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-md font-bold text-white">{collection.name}</h3>
                  <div className="flex items-center gap-3 text-[12px] text-zinc-500 mt-0.5">
                    {collection.customDomain ? (
                      <span className="text-green-500 font-medium">{collection.customDomain}</span>
                    ) : (
                      <span>Domínio padrão</span>
                    )}
                    <span>•</span>
                    <span>{collection._count.nodes} itens</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Link
                  href={`/docs/${collection.slug}`}
                  target="_blank"
                  className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-colors"
                  title="Ver na área pública"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <Link
                  href={`/admin/collections/${collection.id}`}
                  className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-colors"
                  title="Gerenciar"
                >
                  <Settings className="w-4 h-4" />
                </Link>
                <button
                  className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-600 hover:text-red-400 transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
