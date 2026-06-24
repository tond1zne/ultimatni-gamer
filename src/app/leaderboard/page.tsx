import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getWeekState, getLeaderboard } from "@/lib/week";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: { obdobi?: string; tyden?: string };
};

export default async function LeaderboardPage({ searchParams }: Props) {
  const mode = searchParams.obdobi === "all" ? "all" : "week";
  const { active } = await getWeekState();

  const weeks = await prisma.week.findMany({
    where: { status: { in: ["ACTIVE", "CLOSED"] } },
    orderBy: { number: "desc" },
  });

  const fallbackWeek = active ?? weeks[0] ?? null;
  const selectedWeekId = searchParams.tyden || fallbackWeek?.id;
  const selectedWeek = weeks.find((w) => w.id === selectedWeekId) ?? fallbackWeek;

  const leaderboard = selectedWeek
    ? await getLeaderboard(mode === "all" ? null : selectedWeek.id)
    : [];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-3xl sm:text-4xl uppercase">Žebříček</h1>
        <p className="font-mono text-xs text-steel max-w-xl">
          Body se počítají jen ze schválených výzev. Týdenní žebříček se uzavírá vždy po vypršení
          časovače (nebo když ho admin uzavře dřív).
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link href="/leaderboard?obdobi=week" className={mode === "week" ? "tag tag-filled" : "tag"}>
          Týdenní
        </Link>
        <Link href="/leaderboard?obdobi=all" className={mode === "all" ? "tag tag-filled" : "tag"}>
          Celkové (all-time)
        </Link>
      </div>

      {mode === "week" && selectedWeek && (
        <form action="/leaderboard" className="flex items-center gap-2">
          <input type="hidden" name="obdobi" value="week" />
          <label className="font-mono text-xs uppercase tracking-widest text-steel">Týden:</label>
          <select name="tyden" defaultValue={selectedWeek.id} className="input-comic w-auto">
            {weeks.map((w) => (
              <option key={w.id} value={w.id}>
                #{w.number} {w.status === "ACTIVE" ? "(aktivní)" : ""}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-comic-outline text-xs">
            Zobrazit
          </button>
        </form>
      )}

      <div className="comic-panel">
        {!selectedWeek ? (
          <p className="font-mono text-sm text-steel p-5">
            Ještě neproběhl žádný týden. Žebříček se objeví, jakmile admin spustí první týden.
          </p>
        ) : leaderboard.length === 0 ? (
          <p className="font-mono text-sm text-steel p-5">Zatím žádné schválené body.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b-[3px] border-ink font-mono text-[11px] uppercase tracking-widest text-steel">
                <th className="text-left px-5 py-3">#</th>
                <th className="text-left px-2 py-3">Hráč</th>
                <th className="text-left px-2 py-3">Splněné výzvy</th>
                <th className="text-right px-5 py-3">Body</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row, i) => (
                <tr key={row.userId} className={i !== leaderboard.length - 1 ? "border-b-2 border-ink" : ""}>
                  <td className="font-mono scoreboard-num text-xl px-5 py-3">
                    {String(i + 1).padStart(2, "0")}
                  </td>
                  <td className="font-display uppercase px-2 py-3">{row.name}</td>
                  <td className="font-mono text-xs text-steel px-2 py-3">{row.approvedCount}</td>
                  <td className="font-mono scoreboard-num text-xl px-5 py-3 text-right">
                    {row.points} b.
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
