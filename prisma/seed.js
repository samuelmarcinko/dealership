const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "admin@dealership.com";
  const plainPassword = "admin123";

  // Seed default tenant settings
  const defaultSettings = [
    { key: 'primary_color', value: '#f97316' },
    { key: 'custom_css', value: '' },
  ]
  for (const setting of defaultSettings) {
    await prisma.tenantSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (!existing) {
    const hash = await bcrypt.hash(plainPassword, 10);

    await prisma.user.create({
      data: {
        email,
        password: hash,
        name: "Admin",
        role: "ADMIN",
      },
    });

    console.log("Seeded admin user:", email);
  } else {
    console.log("Admin user already exists:", email);
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
