import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  try {
    const sites = await prisma.site.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        collections: true
      }
    });
    
    return NextResponse.json(sites);
  } catch (error) {
    console.error("GET /api/sites error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { name, slug: customSlug, collectionId } = await req.json();
  if (!name) {
    return new NextResponse("Name is required", { status: 400 });
  }

  const slug = customSlug || slugify(name);

  try {
    const site = await prisma.$transaction(async (tx) => {
      // 1. Criar o Site
      const newSite = await tx.site.create({
        data: {
          name,
          slug,
          status: "PUBLISHED" // Sites novos já vêm como publicados por padrão
        },
      });

      // 2. Se tiver collectionId, movemos ela para o novo site
      if (collectionId) {
        await tx.collection.update({
          where: { id: collectionId },
          data: {
            siteId: newSite.id,
            isDefault: true // Torna a coleção principal do novo site
          }
        });
      } else {
        // 3. Caso contrário, criamos uma coleção padrão vazia
        await tx.collection.create({
          data: {
            name: "Documentação",
            slug: "docs",
            siteId: newSite.id,
            isDefault: true
          }
        });
      }

      return newSite;
    });

    return NextResponse.json(site);
  } catch (error: any) {
    console.error("POST /api/sites error:", error);
    if (error.code === 'P2002') {
      return new NextResponse("Site with this name or slug already exists", { status: 400 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
