import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  const collection = await prisma.collection.findUnique({
    where: { slug },
  });

  if (!collection) {
    return new NextResponse("Collection Not Found", { status: 404 });
  }

  // Fetch all nodes for this collection
  const allNodes = await prisma.node.findMany({
    where: { collectionId: collection.id },
    orderBy: { position: "asc" },
    include: {
      document: {
        select: {
          status: true,
        },
      },
    },
  });

  // Recursive function to build the tree
  const buildTree = (parentId: string | null = null): any[] => {
    return allNodes
      .filter((node) => node.parentId === parentId)
      .map((node) => {
        const children = buildTree(node.id);
        
        // Filter out drafts for public users if it's a document
        // Or filter out folders that only contain drafts
        if (!session) {
          if (node.type === "DOCUMENT" && node.document?.status !== "PUBLISHED") {
            return null;
          }
          if (node.type === "FOLDER" && children.length === 0) {
            // This is a simplified check: folders without public children are hidden
            // But they might have public documents deeper. 
            // The recursive nature of buildTree handles this.
            return null;
          }
        }

        return {
          ...node,
          children: children.filter(Boolean),
        };
      })
      .filter(Boolean);
  };

  const tree = buildTree(null);

  return NextResponse.json({
    collection,
    tree,
  });
}
