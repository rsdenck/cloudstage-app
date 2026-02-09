import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { EditorClient } from "./EditorClient";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  const node = await prisma.node.findUnique({
    where: { id },
    include: {
      collection: {
        include: {
          site: true
        }
      },
      content: true
    }
  });

  if (!node || node.type !== "PAGE") {
    notFound();
  }

  const breadcrumbs = [
    { label: node.collection.site.name, href: `/admin/sites/${node.collection.site.id}` },
    { label: node.collection.name, href: `/admin/collections/${node.collection.id}` },
    { label: node.name, href: `/admin/editor/${node.id}` },
  ];

  return <EditorClient node={node} breadcrumbs={breadcrumbs} />;
}
