const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("2020Tra##", 10);

  // 1. Criar Usuário Admin
  const admin = await prisma.user.upsert({
    where: { email: "da1dn@protonmail.com" },
    update: { password: hashedPassword, role: "ADMIN" },
    create: {
      email: "da1dn@protonmail.com",
      name: "Administrador",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log("Admin configurado:", admin.email);

  // 2. Criar Site Inicial (Multi-tenant)
  const site = await prisma.site.upsert({
    where: { slug: "cloudstage" },
    update: {},
    create: {
      name: "Cloudstage Docs",
      slug: "cloudstage",
      domain: "docs.cloudstage.com.br",
      status: "PUBLISHED",
    },
  });
  console.log("Site inicial configurado:", site.slug);

  // 3. Criar Coleção (Space)
  const collection = await prisma.collection.upsert({
    where: { siteId_slug: { siteId: site.id, slug: "main" } },
    update: {},
    create: {
      name: "Documentação Principal",
      slug: "main",
      siteId: site.id,
      isDefault: true,
    },
  });
  console.log("Coleção inicial configurada:", collection.slug);

  // 4. Criar Árvore de Nodes (Hierarquia Infinita)
  // Node Pai (Pasta)
  const parentNode = await prisma.node.upsert({
    where: { collectionId_slug: { collectionId: collection.id, slug: "guia" } },
    update: {},
    create: {
      name: "Guia de Início",
      slug: "guia",
      type: "FOLDER",
      collectionId: collection.id,
      published: true,
      order: 0,
    },
  });

  // Node Filho (Página)
  const childNode = await prisma.node.upsert({
    where: { collectionId_slug: { collectionId: collection.id, slug: "instalacao" } },
    update: {},
    create: {
      name: "Instalação",
      slug: "instalacao",
      type: "PAGE",
      collectionId: collection.id,
      parentId: parentNode.id,
      published: true,
      order: 0,
      content: {
        create: {
          markdown: "# Instalação\n\nBem-vindo ao Cloudstage! Para instalar, execute:\n\n```bash\nnpm install cloudstage\n```",
        }
      }
    },
  });
  console.log("Hierarquia inicial criada: /guia/instalacao");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
