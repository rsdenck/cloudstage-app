import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Settings, Globe, Layers, ExternalLink, ChevronRight } from "lucide-react";
import Link from "next/link";
import { SiteSettingsForm } from "./SiteSettingsForm";

export default async function SiteAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  const site = await prisma.site.findUnique({
    where: { id },
    include: {
      collections: {
        include: {
          _count: {
            select: { nodes: true }
          }
        }
      },
    },
  });

  if (!site) {
    notFound();
  }

  const breadcrumbs = [
    { label: "Admin", href: "/admin" },
    { label: site.name, href: `/admin/sites/${id}` },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Breadcrumbs items={breadcrumbs} className="mb-4 opacity-60 hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">{site.name}</h1>
            <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-bold rounded uppercase tracking-wider border border-green-500/20">
              Workspace
            </span>
          </div>
          <p className="text-slate-400 mt-1">Gerencie as configurações e coleções deste workspace.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/docs/${site.slug}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Ver Site Público
          </Link>
        </div>
      </div>

      <div className="space-y-12">
        {/* Settings Form Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5 text-green-500" />
            <h2 className="text-xl font-bold text-white">Configurações Gerais</h2>
          </div>
          <SiteSettingsForm site={site} />
        </section>

        {/* Collections List Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-green-500" />
              <h2 className="text-xl font-bold text-white">Coleções</h2>
            </div>
          </div>
          
          <div className="bg-[#050505] border border-border rounded-xl overflow-hidden shadow-2xl">
            <div className="divide-y divide-border/50">
              {site.collections.length > 0 ? (
                site.collections.map((collection) => (
                  <Link 
                    key={collection.id}
                    href={`/admin/collections/${collection.id}`}
                    className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Layers className="w-4 h-4 text-zinc-500 group-hover:text-green-500 transition-colors" />
                      <div>
                        <div className="text-sm font-medium text-white group-hover:text-green-400 transition-colors">
                          {collection.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {collection._count.nodes} documentos • /{collection.slug}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {collection.isDefault && (
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-bold rounded uppercase tracking-wider border border-green-500/20">
                          Padrão
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-12 text-center">
                  <p className="text-slate-500 text-sm italic">Nenhuma coleção encontrada.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
