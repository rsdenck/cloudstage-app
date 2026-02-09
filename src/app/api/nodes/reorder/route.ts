import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { items } = await req.json(); // Array de { id: string, order: number, parentId: string | null }

  if (!Array.isArray(items)) {
    return new NextResponse("Invalid items", { status: 400 });
  }

  try {
    // Executar todas as atualizações em uma transação
    await prisma.$transaction(
      items.map((item) =>
        prisma.node.update({
          where: { id: item.id },
          data: { 
            order: item.order,
            parentId: item.parentId
          },
        })
      )
    );

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Erro ao reordenar nodes:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
