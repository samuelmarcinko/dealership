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
    { key: 'hero_badge', value: 'Profesionálny autobazar' },
    { key: 'hero_title', value: 'Nájdite vozidlo' },
    { key: 'hero_title_accent', value: 'svojich snov' },
    { key: 'hero_subtitle', value: 'Ponúkame starostlivo vybrané ojazdené vozidlá za transparentné ceny. Každé auto prešlo technickou kontrolou a je pripravené na cestu.' },
    { key: 'hero_btn1_text', value: 'Prezerať vozidlá' },
    { key: 'hero_btn1_url', value: '/vehicles' },
    { key: 'hero_btn2_text', value: 'Kontaktujte nás' },
    { key: 'hero_btn2_url', value: '/contact' },
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
