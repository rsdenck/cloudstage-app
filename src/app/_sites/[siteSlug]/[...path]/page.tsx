import { prisma } from "@/lib/prisma";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Sidebar } from "@/components/Sidebar";
import { notFound } from "next/navigation";

// Forçar ISR (Incremental Static Regeneration)
export const revalidate = 60; // Revalida a cada 60 segundos

// Gerar caminhos estáticos para os sites mais populares (opcional)
export async function generateStaticParams() {
  const sites = await prisma.site.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true }
  });
  
  return sites.map(site => ({
    siteSlug: site.slug,
    path: []
  }));
}

async function getSiteData(siteSlug: string, path: string[]) {
  // Cache de busca do site
  const site = await prisma.site.findUnique({
    where: { slug: siteSlug },
    include: {
      collections: {
        where: { isDefault: true },
        take: 1,
      },
    },
  });

  if (!site || site.collections.length === 0) return null;

  const collectionId = site.collections[0].id;
  
  // Buscar todos os nodes publicados (Hierarquia infinita)
  const allNodes = await prisma.node.findMany({
    where: { 
      collectionId,
      published: true 
    },
    orderBy: { order: "asc" },
  });

  let currentNode = null;
  if (path.length === 0) {
    currentNode = allNodes.find(n => n.parentId === null);
  } else {
    let parentId: string | null = null;
    for (const segment of path) {
      const node = allNodes.find(n => n.slug === segment && n.parentId === parentId);
      if (!node) return null;
      currentNode = node;
      parentId = node.id;
    }
  }

  if (!currentNode) return null;

  const page = await prisma.node.findUnique({
    where: { id: currentNode.id },
    include: {
      content: true,
      children: {
        where: { published: true },
        orderBy: { order: "asc" }
      }
    },
  });

  return {
    site,
    collection: site.collections[0],
    node: page,
    allNodes,
  };
}

export default async function SitePage({
  params,
}: {
  params: Promise<{ siteSlug: string; path: string[] }>;
}) {
  const { siteSlug, path = [] } = await params;
  const data = await getSiteData(siteSlug, path);

  if (!data || !data.node) {
    notFound();
  }

  const buildTree = (parentId: string | null = null): any[] => {
    return data.allNodes
      .filter((node) => node.parentId === parentId)
      .map((node) => ({
        ...node,
        children: buildTree(node.id),
      }));
  };

  const tree = buildTree(null);

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar 
        tree={tree} 
        collectionSlug={data.collection.slug} 
      />
      
      <main className="flex-1 overflow-y-auto px-8 py-12 max-w-5xl mx-auto scroll-smooth">
        <header className="mb-12 border-b border-white/5 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold mb-4 uppercase tracking-widest">
            <span className="hover:text-green-500 transition-colors cursor-default">{data.site.name}</span>
            <span className="opacity-20">/</span>
            <span className="text-green-500">{data.collection.name}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            {data.node.name}
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl">
            Explore a documentação técnica oficial.
          </p>
        </header>

        <div className="animate-in fade-in duration-700 delay-150">
          {data.node.type === "PAGE" && data.node.content ? (
            <article className="prose prose-invert prose-green max-w-none 
              prose-headings:tracking-tight prose-headings:font-bold
              prose-code:text-green-400 prose-code:bg-green-500/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-zinc-900/50 prose-pre:border prose-pre:border-white/5 prose-pre:rounded-xl">
              <MarkdownRenderer content={data.node.content.markdown} />
            </article>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {data.node.children?.map((child: any) => (
                <Link 
                  key={child.id} 
                  href={`/docs/${siteSlug}/${path.join("/")}/${child.slug}`}
                  className="group p-6 bg-zinc-900/30 border border-white/5 rounded-xl hover:border-green-500/30 hover:bg-zinc-900/50 transition-all duration-300"
                >
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-green-400 transition-colors">{child.name}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">Clique para explorar os documentos desta seção.</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <footer className="mt-24 pt-8 border-t border-white/5 flex items-center justify-between text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
          <span>© 2026 {data.site.name}</span>
          <span className="flex items-center gap-1">
            Powered by <span className="text-green-500/50">Cloudstage</span>
          </span>
        </footer>
      </main>
    </div>
  );
}
