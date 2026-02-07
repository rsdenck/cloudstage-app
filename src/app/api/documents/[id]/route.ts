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

  const document = await prisma.document.findUnique({
    where: { nodeId: id },
    include: {
      node: {
        include: {
          collection: true,
        }
      }
    }
  });

  if (!document) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // If not admin and not published, return 404 or 401
  if (!session && document.status !== "PUBLISHED") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  return NextResponse.json(document);
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

  const { content, status } = await req.json();

  try {
    const document = await prisma.document.update({
      where: { nodeId: id },
      data: {
        ...(content !== undefined && { content }),
        ...(status !== undefined && { status }),
      },
    });

    // If content changed, create a version
    if (content !== undefined) {
      const lastVersion = await prisma.version.findFirst({
        where: { documentId: document.id },
        orderBy: { versionNumber: "desc" },
      });

      await prisma.version.create({
        data: {
          documentId: document.id,
          content,
          versionNumber: (lastVersion?.versionNumber || 0) + 1,
        },
      });
    }

    return NextResponse.json(document);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
