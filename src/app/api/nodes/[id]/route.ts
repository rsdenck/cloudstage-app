import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  try {
    const node = await prisma.node.findUnique({
      where: { id },
      include: {
        content: true,
        collection: true,
      },
    });

    if (!node) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // If not admin and not published, return 401
    if (!session && !node.published) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json(node);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { name, markdown, published, parentId } = await req.json();

  try {
    const updatedNode = await prisma.node.update({
      where: { id },
      data: {
        ...(name && { name, slug: slugify(name) }),
        ...(published !== undefined && { published }),
        ...(parentId !== undefined && { parentId }),
        ...(markdown !== undefined && {
          content: {
            upsert: {
              create: { markdown },
              update: { markdown },
            },
          },
        }),
      },
      include: {
        content: true,
      },
    });

    return NextResponse.json(updatedNode);
  } catch (error: any) {
    console.error("Erro ao atualizar node:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await prisma.node.delete({
      where: { id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
