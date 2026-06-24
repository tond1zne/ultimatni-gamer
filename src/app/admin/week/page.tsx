import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getWeekState } from "@/lib/week";
import Countdown from "@/components/Countdown";
import { startWeek, closeWeek } from "@/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminWeekPage() {
  const { active, pending } = await getWeekState();
  const pastWeeks = await prisma.week.findMany({
    where: { status: "CLOSED" },
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

      {active ? (
        <div className="comic-panel p-6 flex flex-col gap-6">
          <div>
            <span className="tag tag-filled w-fit">BĚŽÍ TÝDEN #{active.number}</span>
            <p className="font-mono text-[11px] text-steel mt-2">
              Začal: {active.startsAt?.toLocaleString("cs-CZ")} · Konec:{" "}
              {active.endsAt?.toLocaleString("cs-CZ")}
            </p>
          </div>

          <Countdown endsAt={active.endsAt!.toISOString()} />

          <div className="border-t-2 border-ink pt-5 flex flex-col gap-3">
            <p className="font-mono text-xs text-steel max-w-md">
              Tlačítko dole okamžitě uzavře aktuální týden (bez ohledu na časovač). Body zůstanou
              zapsané a uzavřené v historii žebříčku. Další týden se znovu spustí až rucně, kdy
              budeš chtít.
            </p>
            <form action={closeWeek}>
              <button type="submit" className="btn-comic w-fit">
                Uzavřít týden #{active.number} hned teď
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="comic-panel p-6 flex flex-col gap-6">
          <div>
            <span className="tag w-fit">TÝDEN #{pending!.number} – PŘIPRAVEN</span>
            <p className="font-mono text-[11px] text-steel mt-2 max-w-md">
              Časovač ještě neběží a hráči nemohou odesílat důkazy, dokud týden nespustíš.
              Výzvy si ale mohou prohlížet už teď.
            </p>
          </div>

          <form action={startWeek} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="weekId" value={pending!.id} />
            <label className="flex flex-col gap-1 font-mono text-[11px] uppercase tracking-widest">
              Délka týdne (dní)
              <input
                name="days"
                type="number"
                min={1}
                max={60}
                defaultValue={7}
                className="input-comic w-28"
              />
            </label>
            <button type="submit" className="btn-comic">
              Spustit týden #{pending!.number}
            </button>
          </form>
        </div>
      )}

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
                      {w.startsAt?.toLocaleDateString("cs-CZ")} – {w.endsAt?.toLocaleDateString("cs-CZ")}
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
