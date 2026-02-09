import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { name, collectionId, description } = await req.json();
    
    if (!name || !collectionId) {
      return new NextResponse("Name and collectionId are required", { status: 400 });
    }

    const slug = slugify(name);

    const space = await prisma.space.create({
      data: {
        name,
        slug,
        description,
        collectionId,
      },
    });

    return NextResponse.json(space);
  } catch (error: any) {
    console.error("POST /api/spaces error:", error);
    if (error.code === 'P2002') {
      return new NextResponse("Space with this name already exists in this collection", { status: 400 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
