import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { approveSubmission, rejectSubmission } from "@/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminSubmissionsPage() {
  const pending = await prisma.submission.findMany({
    where: { status: "PENDING" },
    include: { user: true, challenge: true, week: true },
    orderBy: { createdAt: "asc" },
  });

  const recent = await prisma.submission.findMany({
    where: { status: { in: ["APPROVED", "REJECTED"] } },
    include: { user: true, challenge: true },
    orderBy: { reviewedAt: "desc" },
    take: 15,
  });

  return (
    <div className="flex flex-col gap-10">
      <div>
        <Link href="/admin" className="font-mono text-xs uppercase tracking-widest hover:underline">
          ← Admin
        </Link>
        <h1 className="font-display text-3xl sm:text-4xl uppercase mt-2">Posoudit důkazy</h1>
      </div>

      {pending.length === 0 ? (
        <p className="font-mono text-sm text-steel">Žádné nevyřízené důkazy. Vše posouzeno. 🎉</p>
      ) : (
        <div className="flex flex-col gap-5">
          {pending.map((s) => (
            <div key={s.id} className="comic-panel p-5 flex flex-col gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display uppercase text-lg">{s.challenge.title}</p>
                  <p className="font-mono text-xs text-steel">
                    {s.user.name} ({s.user.email}) · Týden #{s.week.number} ·{" "}
                    {s.createdAt.toLocaleString("cs-CZ")}
                  </p>
                </div>
                <span className="tag">Základ: {s.challenge.points} b.</span>
              </div>

              <a href={s.proofUrl} target="_blank" rel="noreferrer" className="font-mono text-sm underline break-all">
                {s.proofUrl}
              </a>
              {s.note && <p className="font-mono text-xs text-steel">Poznámka hráče: {s.note}</p>}

              <div className="flex flex-wrap gap-3 items-end pt-2 border-t-2 border-ink">
                <form action={approveSubmission} className="flex items-end gap-2">
                  <input type="hidden" name="submissionId" value={s.id} />
                  <label className="flex flex-col gap-1 font-mono text-[11px] uppercase tracking-widest">
                    Body k připsání
                    <input
                      name="points"
                      type="number"
                      min={0}
                      defaultValue={s.challenge.points}
                      className="input-comic w-28"
                    />
                  </label>
                  <button type="submit" className="btn-comic text-xs">
                    Schválit
                  </button>
                </form>

                <form action={rejectSubmission} className="flex items-end gap-2">
                  <input type="hidden" name="submissionId" value={s.id} />
                  <label className="flex flex-col gap-1 font-mono text-[11px] uppercase tracking-widest">
                    Důvod zamítnutí (nepovinné)
                    <input name="reviewNote" type="text" className="input-comic w-56" />
                  </label>
                  <button type="submit" className="btn-comic-outline text-xs">
                    Zamítnout
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl uppercase">Naposledy posouzeno</h2>
        {recent.length === 0 ? (
          <p className="font-mono text-sm text-steel">Zatím nic.</p>
        ) : (
          <div className="comic-panel">
            <table className="w-full">
              <tbody>
                {recent.map((s, i) => (
                  <tr key={s.id} className={i !== recent.length - 1 ? "border-b-2 border-ink" : ""}>
                    <td className="px-4 py-2 font-mono text-xs">{s.user.name}</td>
                    <td className="px-4 py-2 font-display uppercase text-sm">{s.challenge.title}</td>
                    <td className="px-4 py-2">
                      <span className="tag">{s.status === "APPROVED" ? `+${s.pointsAwarded} b.` : "ZAMÍTNUTO"}</span>
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
