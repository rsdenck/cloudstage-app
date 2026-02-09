import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Settings, ExternalLink, Globe, FileText, Folder, ChevronRight, Layers } from "lucide-react";
import Link from "next/link";
import { CollectionSettingsForm } from "./CollectionSettingsForm";
import { CollectionTreeView } from "./CollectionTreeView";

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
      nodes: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!collection) {
    notFound();
  }

  // Função para construir a árvore de documentos
  const buildTree = (nodes: any[], parentId: string | null = null): any[] => {
    return nodes
      .filter(node => node.parentId === parentId)
      .map(node => ({
        ...node,
        children: buildTree(nodes, node.id)
      }));
  };

  const tree = buildTree(collection.nodes);

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
            {collection.isDefault && (
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[10px] font-bold rounded uppercase tracking-wider border border-blue-500/20">
                Padrão
              </span>
            )}
          </div>
          <p className="text-slate-400 mt-1">/{collection.slug}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/docs/${collection.site.slug}/${collection.slug}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Ver Público
          </Link>
        </div>
      </div>

      <div className="space-y-12">
        {/* Settings Form Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5 text-green-500" />
            <h2 className="text-xl font-bold text-white">Configurações da Coleção</h2>
          </div>
          <CollectionSettingsForm collection={collection} />
        </section>

        {/* Document Tree */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-green-500" />
              <h2 className="text-xl font-bold text-white">Estrutura de Documentos</h2>
            </div>
          </div>
          
          <CollectionTreeView tree={tree} collectionId={id} />
        </section>
      </div>
    </div>
  );
}
