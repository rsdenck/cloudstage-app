import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateSiteForm } from "./CreateSiteForm";

export default async function NewSitePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  // Buscar todas as coleções existentes para permitir seleção
  const collections = await prisma.collection.findMany({
    include: {
      site: {
        select: { name: true }
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Novo Workspace</h1>
        <p className="text-zinc-400">Crie um novo espaço de documentação pública ou selecione um conteúdo existente.</p>
      </div>

      <CreateSiteForm collections={collections} />
    </div>
  );
}
