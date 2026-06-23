import { prisma } from "@/lib/prisma";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Vrati aktivni tyden. Pokud uz vyprsel, automaticky ho uzavre a zalozi novy. */
export async function getCurrentWeek() {
  let week = await prisma.week.findFirst({ where: { isActive: true } });

  if (!week) {
    week = await prisma.week.create({
      data: {
        number: 1,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + WEEK_MS),
        isActive: true,
      },
    });
    return week;
  }

  if (week.endsAt.getTime() <= Date.now()) {
    await prisma.week.update({
      where: { id: week.id },
      data: { isActive: false, closedAt: new Date() },
    });
    const next = await prisma.week.create({
      data: {
        number: week.number + 1,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + WEEK_MS),
        isActive: true,
      },
    });
    return next;
  }

  return week;
}

export async function closeCurrentWeekAndStartNext() {
  const week = await prisma.week.findFirst({ where: { isActive: true } });
  if (week) {
    await prisma.week.update({
      where: { id: week.id },
      data: { isActive: false, closedAt: new Date() },
    });
  }
  const nextNumber = week ? week.number + 1 : 1;
  return prisma.week.create({
    data: {
      number: nextNumber,
      startsAt: new Date(),
      endsAt: new Date(Date.now() + WEEK_MS),
      isActive: true,
    },
  });
}

export type LeaderboardRow = {
  userId: string;
  name: string;
  points: number;
  approvedCount: number;
};

/** Zebricek za dany tyden (nebo all-time, kdyz weekId === null) */
export async function getLeaderboard(weekId: string | null): Promise<LeaderboardRow[]> {
  const submissions = await prisma.submission.findMany({
    where: {
      status: "APPROVED",
      ...(weekId ? { weekId } : {}),
    },
    select: {
      userId: true,
      pointsAwarded: true,
      user: { select: { name: true } },
    },
  });

  const map = new Map<string, LeaderboardRow>();
  for (const s of submissions) {
    const row = map.get(s.userId) ?? {
      userId: s.userId,
      name: s.user.name,
      points: 0,
      approvedCount: 0,
    };
    row.points += s.pointsAwarded ?? 0;
    row.approvedCount += 1;
    map.set(s.userId, row);
  }

  return Array.from(map.values()).sort((a, b) => b.points - a.points);
}

/** Zebricek pro jednu konkretni vyzvu (all-time) */
export async function getChallengeLeaderboard(challengeId: string): Promise<LeaderboardRow[]> {
  const submissions = await prisma.submission.findMany({
    where: { status: "APPROVED", challengeId },
    select: {
      userId: true,
      pointsAwarded: true,
      createdAt: true,
      user: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const map = new Map<string, LeaderboardRow>();
  for (const s of submissions) {
    const row = map.get(s.userId) ?? {
      userId: s.userId,
      name: s.user.name,
      points: 0,
      approvedCount: 0,
    };
    row.points += s.pointsAwarded ?? 0;
    row.approvedCount += 1;
    map.set(s.userId, row);
  }

  return Array.from(map.values()).sort((a, b) => b.points - a.points);
}
