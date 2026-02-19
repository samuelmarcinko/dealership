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
    { key: 'font_preset', value: 'default' },
    { key: 'navbar_style', value: 'dark' },
    { key: 'footer_tagline', value: 'Váš spoľahlivý partner pri kúpe ojazdených vozidiel. Férové ceny, overené vozidlá, profesionálny prístup.' },
    { key: 'stat_1_value', value: '500+' },
    { key: 'stat_1_label', value: 'Predaných vozidiel' },
    { key: 'stat_2_value', value: '98%' },
    { key: 'stat_2_label', value: 'Spokojných zákazníkov' },
    { key: 'stat_3_value', value: '10+' },
    { key: 'stat_3_label', value: 'Rokov na trhu' },
    { key: 'stat_4_value', value: '24/7' },
    { key: 'stat_4_label', value: 'Online podpora' },
    { key: 'feature_1_icon', value: 'shield' },
    { key: 'feature_1_title', value: 'Overené vozidlá' },
    { key: 'feature_1_desc', value: 'Každé vozidlo prechádza dôkladnou technickou kontrolou pred predajom.' },
    { key: 'feature_2_icon', value: 'award' },
    { key: 'feature_2_title', value: 'Záruka kvality' },
    { key: 'feature_2_desc', value: 'Poskytujeme záruku na všetky predané vozidlá a odborné poradenstvo.' },
    { key: 'feature_3_icon', value: 'trending_down' },
    { key: 'feature_3_title', value: 'Férové ceny' },
    { key: 'feature_3_desc', value: 'Transparentné ceny bez skrytých poplatkov. Čo vidíte, to zaplatíte.' },
    { key: 'feature_4_icon', value: 'headphones' },
    { key: 'feature_4_title', value: 'Podpora zákazníkov' },
    { key: 'feature_4_desc', value: 'Náš tím je tu pre vás pred aj po kúpe vozidla. Vždy ochotní poradiť.' },
    { key: 'banner_enabled', value: 'false' },
    { key: 'banner_text', value: '' },
    { key: 'banner_url', value: '' },
    { key: 'banner_bg_color', value: 'bg-primary' },
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
