const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("2020Tra#", 10);

  const admin = await prisma.user.upsert({
    where: { email: "da1dn@protonmail.com" },
    update: {
      password: hashedPassword,
    },
    create: {
      email: "da1dn@protonmail.com",
      name: "Administrador",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log({ admin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
