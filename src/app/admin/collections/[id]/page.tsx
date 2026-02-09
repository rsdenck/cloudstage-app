import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Settings, ExternalLink, Globe, FileText, Folder } from "lucide-react";
import Link from "next/link";

export default async function CollectionAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  const collection = await prisma.collection.findUnique({
    where: { id },
    include: {
      site: true,
      _count: {
        select: { nodes: true }
      },
      nodes: {
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: {
          content: true
        }
      }
    },
  });

  if (!collection) {
    notFound();
  }

  const breadcrumbs = [
    { label: "Admin", href: "/admin" },
    { label: collection.site.name, href: `/admin/sites/${collection.site.id}` },
    { label: collection.name, href: `/admin/collections/${id}` },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Breadcrumbs items={breadcrumbs} className="mb-4 opacity-60 hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">{collection.name}</h1>
            <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-bold rounded uppercase tracking-wider border border-green-500/20">
              Coleção
            </span>
          </div>
          <p className="text-slate-400 mt-1">Gerencie as configurações e visualize o conteúdo desta coleção.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/docs/${collection.site.slug}/${collection.slug}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Ver Pública
          </Link>
          <button className="p-2 border border-border rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="bg-[#050505] border border-border rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-2 text-slate-400">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Total de Itens</span>
          </div>
          <div className="text-3xl font-bold text-white">{collection._count.nodes}</div>
        </div>

        <div className="bg-[#050505] border border-border rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-2 text-slate-400">
            <Globe className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Status</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xl font-bold text-white">Ativa</span>
          </div>
        </div>

        <div className="bg-[#050505] border border-border rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-2 text-slate-400">
            <Settings className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Domínio</span>
          </div>
          <div className="text-sm font-medium text-slate-300 truncate">
            {collection.site.slug}.cloudstage.io
          </div>
        </div>

        {/* Recent Content */}
        <div className="md:col-span-3 bg-[#050505] border border-border rounded-xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-border bg-white/5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white text-lg">Documentos Recentes</h2>
              <p className="text-sm text-slate-500">Últimos itens modificados nesta coleção.</p>
            </div>
            <Link 
              href="/admin" 
              className="text-xs font-bold text-green-500 hover:text-green-400 uppercase tracking-widest"
            >
              Ver Tudo
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {collection.nodes.length > 0 ? (
              collection.nodes.map((node) => (
                <Link 
                  key={node.id}
                  href={node.type === 'PAGE' ? `/admin/editor/${node.id}` : '#'}
                  className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    {node.type === 'FOLDER' ? (
                      <Folder className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <FileText className="w-4 h-4 text-green-500/50" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-green-400 transition-colors">
                        {node.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Editado em {new Date(node.updatedAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                </Link>
              ))
            ) : (
              <div className="p-12 text-center">
                <p className="text-slate-500 text-sm italic">Nenhum documento criado ainda.</p>
                <p className="text-slate-600 text-[11px] mt-1">Use a barra lateral para criar seu primeiro documento.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
