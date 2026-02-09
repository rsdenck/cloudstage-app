import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/Sidebar";
import { notFound } from "next/navigation";

async function getTree(slug: string) {
  const collection = await prisma.collection.findFirst({
    where: { slug },
  });

  if (!collection) return null;

  const allNodes = await prisma.node.findMany({
    where: { collectionId: collection.id },
    orderBy: { order: "asc" },
    include: {
      content: {
        select: {
          id: true,
        },
      },
    },
  });

  const buildTree = (parentId: string | null = null, currentPath: string[] = []): any[] => {
    return allNodes
      .filter((node) => node.parentId === parentId)
      .map((node) => {
        const nodePath = [...currentPath, node.slug];
        const children = buildTree(node.id, nodePath);
        
        // Public view: only show published documents and folders with published children
        if (node.type === "PAGE" && !node.published) {
          return null;
        }
        if (node.type === "FOLDER" && children.length === 0) {
          return null;
        }

        return {
          ...node,
          fullPath: nodePath.join("/"),
          children,
        };
      })
      .filter(Boolean);
  };

  return {
    collection,
    tree: buildTree(null),
  };
}

export default async function DocsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getTree(slug);

  if (!data) {
    notFound();
  }

  return (
    <div className="flex">
      <Sidebar tree={data.tree} collectionSlug={slug} />
      <div className="flex-1 overflow-y-auto h-[calc(100vh-64px)]">
        {children}
      </div>
    </div>
  );
}
