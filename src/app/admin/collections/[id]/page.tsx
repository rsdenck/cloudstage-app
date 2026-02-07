import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { AdminTree } from "@/components/AdminTree";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Settings, ExternalLink } from "lucide-react";
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
  });

  if (!collection) {
    notFound();
  }

  const allNodes = await prisma.node.findMany({
    where: { collectionId: id },
    orderBy: { position: "asc" },
    include: {
      document: {
        select: {
          status: true,
        },
      },
    },
  });

  const buildTree = (parentId: string | null = null): any[] => {
    return allNodes
      .filter((node) => node.parentId === parentId)
      .map((node) => ({
        ...node,
        children: buildTree(node.id),
      }));
  };

  const tree = buildTree(null);

  const breadcrumbs = [
    { label: "Admin", href: "/admin" },
    { label: collection.name, href: `/admin/collections/${id}` },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Breadcrumbs items={breadcrumbs} className="mb-4 opacity-60 hover:opacity-100 transition-opacity" />
          <h1 className="text-3xl font-bold text-white">{collection.name}</h1>
          <p className="text-slate-400">Gerencie a estrutura e o conteúdo desta categoria.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/docs/${collection.slug}`}
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

      <div className="bg-sidebar border border-border rounded-xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-border bg-green-500/5">
          <h2 className="font-semibold text-white text-lg">Estrutura de Conteúdo</h2>
          <p className="text-sm text-slate-500">Adicione pastas e documentos para organizar seu conhecimento.</p>
        </div>
        <div className="p-6">
          <AdminTree initialTree={tree} collectionId={id} collectionSlug={collection.slug} />
        </div>
      </div>
    </div>
  );
}
