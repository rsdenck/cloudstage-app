import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ChevronRight, Box } from "lucide-react";
import Link from "next/link";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ slug: string; path: string[] }>;
}) {
  const { slug, path } = await params;
  const docSlug = path[path.length - 1];

  const node = await prisma.node.findFirst({
    where: {
      slug: docSlug,
      collection: { slug },
      type: "PAGE",
      published: true,
    },
    include: {
      content: true,
      collection: true,
    },
  });

  if (!node || !node.content) {
    notFound();
  }

  // Find next document in the same collection (simplified logic)
  const nextNode = await prisma.node.findFirst({
    where: {
      collectionId: node.collectionId,
      type: "PAGE",
      id: { not: node.id },
      order: { gt: node.order },
      published: true
    },
    orderBy: { order: "asc" }
  });

  // Build breadcrumbs
  const breadcrumbs = [
    { label: node.collection.name, href: `/docs/${slug}` },
    ...path.slice(0, -1).map((p, i) => ({
      label: p.charAt(0).toUpperCase() + p.slice(1),
      href: `/docs/${slug}/${path.slice(0, i + 1).join("/")}`,
    })),
    { label: node.name, href: `/docs/${slug}/${path.join("/")}` },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-12 py-10">
      <Breadcrumbs items={breadcrumbs} className="mb-8 opacity-60 hover:opacity-100 transition-opacity" />
      
      <article>
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Box className="w-6 h-6 text-green-500" />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              {node.name}
            </h1>
          </div>
          <p className="text-slate-400 text-lg">
            {node.name} documentation.
          </p>
        </header>

        <MarkdownRenderer content={node.content.markdown} />
      </article>

      {nextNode && (
        <Link 
          href={`/docs/${slug}/${nextNode.slug}`}
          className="mt-16 group block p-6 rounded-2xl border border-border bg-white/5 hover:bg-white/10 transition-all shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Próximo</p>
              <h3 className="text-lg font-semibold text-white group-hover:text-green-400 transition-colors">{nextNode.name}</h3>
            </div>
            <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-green-500 transition-all translate-x-0 group-hover:translate-x-1" />
          </div>
        </Link>
      )}

      <footer className="mt-20 pt-8 border-t border-border flex justify-between items-center text-[13px] text-slate-500">
        <span>Última atualização em {new Date(node.content.updatedAt).toLocaleDateString("pt-BR")}</span>
        <div className="flex gap-4">
          <Link href={`/admin/editor/${node.id}`} className="hover:text-white transition-colors">Editar página</Link>
          <button className="hover:text-white transition-colors">Feedback</button>
        </div>
      </footer>
    </div>
  );
}
