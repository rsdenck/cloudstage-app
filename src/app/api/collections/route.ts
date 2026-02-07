import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  try {
    const collections = await prisma.collection.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { nodes: true }
        }
      }
    });
    
    return NextResponse.json(collections);
  } catch (error) {
    console.error("GET /api/collections error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { name, description, customDomain } = await req.json();
  if (!name) {
    return new NextResponse("Name is required", { status: 400 });
  }

  const slug = slugify(name);

  try {
    const collection = await prisma.collection.create({
      data: {
        name,
        description,
        slug,
        customDomain: customDomain || null,
      },
    });

    return NextResponse.json(collection);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return new NextResponse("Collection with this name already exists", { status: 400 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
