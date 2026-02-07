import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const collectionId = searchParams.get("collectionId");
  const parentId = searchParams.get("parentId");

  if (!collectionId) {
    return new NextResponse("Collection ID is required", { status: 400 });
  }

  const nodes = await prisma.node.findMany({
    where: {
      collectionId,
      parentId: parentId || null,
    },
    orderBy: { position: "asc" },
    include: {
      document: {
        select: {
          status: true,
        }
      },
      _count: {
        select: { children: true }
      }
    }
  });

  return NextResponse.json(nodes);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { name, type, collectionId, parentId } = await req.json();

  if (!name || !type || !collectionId) {
    return new NextResponse("Missing required fields", { status: 400 });
  }

  const slug = slugify(name);

  try {
    const node = await prisma.$transaction(async (tx) => {
      const newNode = await tx.node.create({
        data: {
          name,
          slug,
          type,
          collectionId,
          parentId: parentId || null,
        },
      });

      if (type === "DOCUMENT") {
        await tx.document.create({
          data: {
            nodeId: newNode.id,
            content: `# ${name}\n\nComece a escrever aqui...`,
            status: "DRAFT",
          },
        });
      }

      return newNode;
    });

    return NextResponse.json(node);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return new NextResponse("A node with this name already exists in this folder", { status: 400 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
