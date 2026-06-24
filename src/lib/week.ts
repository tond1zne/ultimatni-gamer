import { prisma } from "@/lib/prisma";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Najde/vytvori "pripravovany" tyden, ktery jeste nebyl spusten (bez startsAt/endsAt). */
async function ensurePendingWeek() {
  let pending = await prisma.week.findFirst({ where: { status: "PENDING" } });
  if (!pending) {
    const last = await prisma.week.findFirst({ orderBy: { number: "desc" } });
    pending = await prisma.week.create({
      data: { number: (last?.number ?? 0) + 1, status: "PENDING" },
    });
  }
  return pending;
}

export type WeekState = {
  active: Awaited<ReturnType<typeof prisma.week.findFirst>> | null;
  pending: Awaited<ReturnType<typeof prisma.week.findFirst>> | null;
};

/**
 * Vrati aktualni stav tydne:
 * - active: bezici tyden s casovacem (nebo null, pokud admin jeste nic nespustil / tyden vyprsel)
 * - pending: tyden pripraveny ke spusteni adminem (existuje jen kdyz active === null)
 * Pokud aktivnimu tydnu vyprsel cas, automaticky se uzavre (ale dalsi se NESPOUSTI automaticky).
 */
export async function getWeekState(): Promise<WeekState> {
  const active = await prisma.week.findFirst({ where: { status: "ACTIVE" } });

  if (active && active.endsAt && active.endsAt.getTime() <= Date.now()) {
    await prisma.week.update({
      where: { id: active.id },
      data: { status: "CLOSED", closedAt: new Date() },
    });
    const pending = await ensurePendingWeek();
    return { active: null, pending };
  }

  if (active) {
    return { active, pending: null };
  }

  const pending = await ensurePendingWeek();
  return { active: null, pending };
}

/** Admin rucne spusti pripraveny tyden - od tohoto okamziku bezi casovac. */
export async function startWeek(weekId: string, days = 7) {
  const alreadyActive = await prisma.week.findFirst({ where: { status: "ACTIVE" } });
  if (alreadyActive) {
    throw new Error("Už běží aktivní týden – nejdřív ho uzavři.");
  }

  const now = new Date();
  return prisma.week.update({
    where: { id: weekId },
    data: {
      status: "ACTIVE",
      startsAt: now,
      endsAt: new Date(now.getTime() + days * DAY_MS),
    },
  });
}

/** Admin rucne predcasne uzavre aktivni tyden. Novy tyden se vytvori jako "pending" (nespusti se sam). */
export async function closeActiveWeekNow() {
  const active = await prisma.week.findFirst({ where: { status: "ACTIVE" } });
  if (active) {
    await prisma.week.update({
      where: { id: active.id },
      data: { status: "CLOSED", closedAt: new Date() },
    });
  }
  return ensurePendingWeek();
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
