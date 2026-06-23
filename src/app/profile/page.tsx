import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "ČEKÁ",
  APPROVED: "SCHVÁLENO",
  REJECTED: "ZAMÍTNUTO",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const submissions = await prisma.submission.findMany({
    where: { userId: session.user.id },
    include: { challenge: true, week: true },
    orderBy: { createdAt: "desc" },
  });

  const totalPoints = submissions
    .filter((s) => s.status === "APPROVED")
    .reduce((sum, s) => sum + (s.pointsAwarded ?? 0), 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="comic-panel p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl uppercase">{session.user.name}</h1>
          <p className="font-mono text-xs text-steel">{session.user.email}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[11px] uppercase tracking-widest text-steel">
            Celkové body (all-time)
          </p>
          <p className="font-mono scoreboard-num text-4xl">{totalPoints}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl uppercase">Moje odeslané důkazy</h2>

        {submissions.length === 0 ? (
          <p className="font-mono text-sm text-steel">
            Ještě jsi nic neodeslal/a.{" "}
            <Link href="/challenges" className="underline">
              Vyber si výzvu
            </Link>
            .
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {submissions.map((s) => (
              <div key={s.id} className="comic-panel-tight p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/challenges/${s.challengeId}`} className="font-display uppercase hover:underline">
                    {s.challenge.title}
                  </Link>
                  <span className="tag tag-filled whitespace-nowrap">{STATUS_LABEL[s.status]}</span>
                </div>
                <p className="font-mono text-[11px] text-steel">
                  Týden #{s.week.number} · {s.createdAt.toLocaleDateString("cs-CZ")}
                </p>
                <p className="font-mono text-xs break-all">{s.proofUrl}</p>
                {s.status === "APPROVED" && (
                  <p className="font-mono text-sm">+{s.pointsAwarded} bodů</p>
                )}
                {s.status === "REJECTED" && s.reviewNote && (
                  <p className="font-mono text-xs text-steel">Poznámka admina: {s.reviewNote}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
