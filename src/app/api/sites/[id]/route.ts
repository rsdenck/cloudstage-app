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

  const { name, slug, domain, status, icon } = await req.json();
  
  if (!name && !slug && !domain && !status && !icon) {
    return new NextResponse("At least one field is required", { status: 400 });
  }

  try {
    const site = await prisma.site.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug: slugify(slug) }),
        ...(domain !== undefined && { domain: domain || null }),
        ...(status && { status }),
        ...(icon !== undefined && { icon: icon || null }),
      },
    });

    return NextResponse.json(site);
  } catch (error: any) {
    console.error("PATCH /api/sites/[id] error details:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
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
    await prisma.site.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/sites/[id] error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
