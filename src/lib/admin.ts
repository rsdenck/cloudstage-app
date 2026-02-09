import { prisma } from "@/lib/prisma";

export async function getAdminSidebarData() {
  const sites = await prisma.site.findMany({
    orderBy: { name: "asc" },
    include: {
      collections: {
        include: {
          nodes: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  return sites;
}
