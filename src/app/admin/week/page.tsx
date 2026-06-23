import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentWeek } from "@/lib/week";
import Countdown from "@/components/Countdown";
import { closeWeek } from "@/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminWeekPage() {
  const week = await getCurrentWeek();
  const pastWeeks = await prisma.week.findMany({
    where: { isActive: false },
    orderBy: { number: "desc" },
    take: 10,
  });

  return (
    <div className="flex flex-col gap-10">
      <div>
        <Link href="/admin" className="font-mono text-xs uppercase tracking-widest hover:underline">
          ← Admin
        </Link>
        <h1 className="font-display text-3xl sm:text-4xl uppercase mt-2">Týden</h1>
      </div>

      <div className="comic-panel p-6 flex flex-col gap-6">
        <div>
          <span className="tag tag-filled w-fit">AKTIVNÍ TÝDEN #{week.number}</span>
          <p className="font-mono text-[11px] text-steel mt-2">
            Začal: {week.startsAt.toLocaleString("cs-CZ")} · Konec: {week.endsAt.toLocaleString("cs-CZ")}
          </p>
        </div>

        <Countdown endsAt={week.endsAt.toISOString()} />

        <div className="border-t-2 border-ink pt-5 flex flex-col gap-3">
          <p className="font-mono text-xs text-steel max-w-md">
            Tlačítko dole okamžitě uzavře aktuální týden (bez ohledu na časovač) a spustí nový
            7denní týden. Body za aktuální týden zůstanou zapsané a uzavřené v historii žebříčku.
          </p>
          <form action={closeWeek}>
            <button type="submit" className="btn-comic">
              Uzavřít týden #{week.number} a spustit nový
            </button>
          </form>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl uppercase">Historie týdnů</h2>
        {pastWeeks.length === 0 ? (
          <p className="font-mono text-sm text-steel">Zatím žádný uzavřený týden.</p>
        ) : (
          <div className="comic-panel">
            <table className="w-full">
              <tbody>
                {pastWeeks.map((w, i) => (
                  <tr key={w.id} className={i !== pastWeeks.length - 1 ? "border-b-2 border-ink" : ""}>
                    <td className="px-4 py-2 font-display uppercase">Týden #{w.number}</td>
                    <td className="px-4 py-2 font-mono text-xs text-steel">
                      {w.startsAt.toLocaleDateString("cs-CZ")} – {w.endsAt.toLocaleDateString("cs-CZ")}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Link
                        href={`/leaderboard?obdobi=week&tyden=${w.id}`}
                        className="font-mono text-xs underline"
                      >
                        Žebříček →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
