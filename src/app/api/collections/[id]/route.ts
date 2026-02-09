import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { name, description, customDomain } = await req.json();

  try {
    const updatedCollection = await prisma.collection.update({
      where: { id },
      data: {
        ...(name && { name, slug: slugify(name) }),
        ...(description !== undefined && { description }),
        ...(customDomain !== undefined && { customDomain }),
      },
    });

    return NextResponse.json(updatedCollection);
  } catch (error: any) {
    console.error("Erro ao atualizar coleção:", error);
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
    // Note: This will delete all nodes associated with the collection due to cascade or manual check
    await prisma.collection.delete({
      where: { id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erro ao excluir coleção:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
