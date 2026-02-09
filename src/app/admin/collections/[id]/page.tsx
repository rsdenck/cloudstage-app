import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { AdminTree } from "@/components/AdminTree";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Settings, ExternalLink, Globe } from "lucide-react";
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
      nodes: {
        where: { parentId: null },
        orderBy: { order: "asc" },
        include: {
          children: {
            orderBy: { order: "asc" },
            include: {
              children: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
      },
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
          <p className="text-slate-400 mt-1">Gerencie a hierarquia infinita de documentos.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/docs/${collection.site.slug}/${collection.slug}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Ver Pública
          </Link>
          <button className="p-2 border border-border rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-[#050505] border border-border rounded-xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-border bg-green-500/5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white text-lg">Estrutura de Conteúdo</h2>
              <p className="text-sm text-slate-500">Arraste e solte para organizar pastas e páginas.</p>
            </div>
          </div>
          <div className="p-6">
            <AdminTree 
              tree={collection.nodes} 
              collectionId={collection.id} 
              collectionSlug={collection.slug} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
