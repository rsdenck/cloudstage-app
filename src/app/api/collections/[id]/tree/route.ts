import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const collection = await prisma.collection.findUnique({
    where: { id },
  });

  if (!collection) {
    return new NextResponse("Collection Not Found", { status: 404 });
  }

  // Fetch all nodes for this collection
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

  // Recursive function to build the tree
  const buildTree = (parentId: string | null = null): any[] => {
    return allNodes
      .filter((node) => node.parentId === parentId)
      .map((node) => {
        const children = buildTree(node.id);
        
        // Filter out drafts for public users if it's a document
        if (!session) {
          if (node.type === "PAGE" && !node.published) {
            return null;
          }
          if (node.type === "FOLDER" && children.length === 0) {
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
