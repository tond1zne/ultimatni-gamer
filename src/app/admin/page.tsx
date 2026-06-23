import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentWeek } from "@/lib/week";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const week = await getCurrentWeek();
  const pendingCount = await prisma.submission.count({ where: { status: "PENDING" } });
  const challengeCount = await prisma.challenge.count({ where: { isArchived: false } });
  const userCount = await prisma.user.count();

  const cards = [
    { href: "/admin/submissions", label: "Posoudit důkazy", value: pendingCount, hint: "čeká na vyhodnocení" },
    { href: "/admin/challenges", label: "Výzvy", value: challengeCount, hint: "aktivních výzev" },
    { href: "/admin/week", label: `Týden #${week.number}`, value: userCount, hint: "registrovaných hráčů" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-3xl sm:text-4xl uppercase">Admin</h1>

      <div className="grid sm:grid-cols-3 gap-5">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="comic-panel p-6 flex flex-col gap-2 hover:-translate-y-0.5 transition-transform">
            <span className="font-mono text-[11px] uppercase tracking-widest text-steel">{c.label}</span>
            <span className="font-mono scoreboard-num text-4xl">{c.value}</span>
            <span className="font-mono text-[11px] text-steel">{c.hint}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
