import { PrismaClient, Category, Difficulty } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // --- admin ucet ---
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@streamer.gg";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin123";

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        password: await bcrypt.hash(adminPassword, 10),
        role: "ADMIN",
      },
    });
    console.log(`Admin ucet vytvoren: ${adminEmail} / ${adminPassword} (zmen si heslo!)`);
  }

  // --- prvni tyden ---
  const activeWeek = await prisma.week.findFirst({ where: { isActive: true } });
  if (!activeWeek) {
    const now = new Date();
    const endsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    await prisma.week.create({
      data: { number: 1, startsAt: now, endsAt, isActive: true },
    });
    console.log("Tyden #1 vytvoren.");
  }

  // --- ukazkove vyzvy ---
  const count = await prisma.challenge.count();
  if (count === 0) {
    await prisma.challenge.createMany({
      data: [
        {
          title: "Hole-in-one ve virtualnim golfu",
          description: "Dosahni hole-in-one na jakekoliv mape v golfove hre. Nahraj klip jako dukaz.",
          category: Category.GAME,
          difficulty: Difficulty.HARD,
          points: 50,
        },
        {
          title: "Dokonceni GTA mise bez umrti",
          description: "Projdi libovolnou hlavni misi v GTA bez jedineho umrti / restartu.",
          category: Category.GAME,
          difficulty: Difficulty.MEDIUM,
          points: 30,
        },
        {
          title: "Oslov 5 cizich lidi na ulici",
          description: "Zacni rozhovor s 5 neznamymi lidmi behem dne. Vse natoc.",
          category: Category.IRL,
          difficulty: Difficulty.MEDIUM,
          points: 35,
        },
        {
          title: "Zazpivej na verejnosti karaoke",
          description: "Zazpivej nahlas znamou pisen na verejnem miste. Cim vetsi publikum, tim lepsi.",
          category: Category.IRL,
          difficulty: Difficulty.EASY,
          points: 15,
        },
        {
          title: "Speedrun cele hry pod 1 hodinu",
          description: "Dohraj libovolnou hru (kampan) pod 60 minut. Musi byt videt cas behu.",
          category: Category.GAME,
          difficulty: Difficulty.INSANE,
          points: 80,
        },
      ],
    });
    console.log("Ukazkove vyzvy vytvoreny.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
