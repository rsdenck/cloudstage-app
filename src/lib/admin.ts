import { prisma } from "@/lib/prisma";

export async function getAdminSidebarData() {
  const sites = await prisma.site.findMany({
    orderBy: { name: "asc" },
    include: {
      collections: {
        include: {
          nodes: {
            where: { parentId: null },
            orderBy: { order: "asc" },
            include: {
              children: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
      },
    },
  });

  return sites;
}
