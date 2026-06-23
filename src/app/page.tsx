import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentWeek, getLeaderboard } from "@/lib/week";
import Countdown from "@/components/Countdown";
import ChallengeCard from "@/components/ChallengeCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const week = await getCurrentWeek();

if (!week) {
  return (
    <div className="p-6">
      Žádný aktivní týden zatím neexistuje.
    </div>
  );
}
  const challenges = await prisma.challenge.findMany({
    where: { isArchived: false },
    orderBy: { points: "desc" },
    take: 6,
  });
  const leaderboard = (await getLeaderboard(week.id)).slice(0, 5);

  return (
    <div className="flex flex-col gap-16">
      {/* HERO */}
      <section className="comic-panel relative overflow-hidden px-6 sm:px-10 py-12 sm:py-16">
        <div className="halftone-dim absolute inset-0 pointer-events-none" />
        <div className="relative flex flex-col gap-6">
          <span className="tag tag-filled w-fit">TYDEN #{week.number}</span>
          <h1 className="font-display text-4xl sm:text-6xl uppercase leading-[0.95] max-w-3xl">
            Splň výzvu.
            <br />
            Natoč důkaz.
            <br />
            Sbírej body.
          </h1>
          <p className="font-body text-steel max-w-xl">
            Herní cíle i šílenosti v reálném životě. Každá výzva má svou bodovou hodnotu –
            čím těžší, tím víc bodů. Nikdo nemusí splnit vše. Body se uzavírají každý týden.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-end gap-6 mt-2">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-steel mb-2">
                Tento týden končí za
              </p>
              <Countdown endsAt={week.endsAt.toISOString()} />
            </div>
            <Link href="/challenges" className="btn-comic w-fit">
              Zobrazit výzvy
            </Link>
          </div>
        </div>
      </section>

      {/* AKTIVNI VYZVY */}
      <section className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl sm:text-3xl uppercase">Aktivní výzvy</h2>
          <Link href="/challenges" className="font-mono text-xs uppercase tracking-widest hover:underline">
            Vše →
          </Link>
        </div>

        {challenges.length === 0 ? (
          <p className="font-mono text-sm text-steel">Zatím žádné výzvy. Admin je brzy přidá.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {challenges.map((c) => (
              <ChallengeCard
                key={c.id}
                id={c.id}
                title={c.title}
                description={c.description}
                category={c.category}
                difficulty={c.difficulty}
                points={c.points}
              />
            ))}
          </div>
        )}
      </section>

      {/* MINI ZEBRICEK */}
      <section className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl sm:text-3xl uppercase">Žebříček tohoto týdne</h2>
          <Link href="/leaderboard" className="font-mono text-xs uppercase tracking-widest hover:underline">
            Celý žebříček →
          </Link>
        </div>

        <div className="comic-panel">
          {leaderboard.length === 0 ? (
            <p className="font-mono text-sm text-steel p-5">
              Ještě nikdo nemá schválené body. Buď první.
            </p>
          ) : (
            <table className="w-full">
              <tbody>
                {leaderboard.map((row, i) => (
                  <tr key={row.userId} className={i !== leaderboard.length - 1 ? "border-b-2 border-ink" : ""}>
                    <td className="font-mono scoreboard-num text-xl px-5 py-3 w-16">
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td className="font-display uppercase px-2 py-3">{row.name}</td>
                    <td className="font-mono scoreboard-num text-xl px-5 py-3 text-right">
                      {row.points} b.
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
