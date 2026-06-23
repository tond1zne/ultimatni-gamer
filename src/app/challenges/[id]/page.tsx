import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWeek, getChallengeLeaderboard } from "@/lib/week";
import PointBurst from "@/components/PointBurst";
import SubmitProofForm from "@/components/SubmitProofForm";

export const dynamic = "force-dynamic";

const DIFFICULTY_LABEL: Record<string, string> = {
  EASY: "LEHKA",
  MEDIUM: "STREDNI",
  HARD: "TEZKA",
  INSANE: "SILENA",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "ČEKÁ NA POSOUZENÍ",
  APPROVED: "SCHVÁLENO",
  REJECTED: "ZAMÍTNUTO",
};

export default async function ChallengeDetailPage({ params }: { params: { id: string } }) {
  const challenge = await prisma.challenge.findUnique({ where: { id: params.id } });
  if (!challenge) notFound();

  const session = await getServerSession(authOptions);
  const week = await getCurrentWeek();
  const leaderboard = await getChallengeLeaderboard(challenge.id);

  let mySubmission = null;
  if (session?.user) {
    mySubmission = await prisma.submission.findUnique({
      where: {
        userId_challengeId_weekId: {
          userId: session.user.id,
          challengeId: challenge.id,
          weekId: week.id,
        },
      },
    });
  }

  return (
    <div className="flex flex-col gap-10">
      <Link href="/challenges" className="font-mono text-xs uppercase tracking-widest hover:underline w-fit">
        ← Zpět na výzvy
      </Link>

      <section className="comic-panel p-6 sm:p-10 flex flex-col sm:flex-row gap-8 sm:items-start justify-between">
        <div className="flex flex-col gap-4 max-w-2xl">
          <div className="flex flex-wrap gap-2">
            <span className={`tag ${challenge.category === "GAME" ? "tag-filled" : ""}`}>
              {challenge.category === "GAME" ? "HRA" : "IRL"}
            </span>
            <span className="tag">{DIFFICULTY_LABEL[challenge.difficulty]}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl uppercase leading-tight">
            {challenge.title}
          </h1>
          <p className="font-body text-steel">{challenge.description}</p>
        </div>
        <PointBurst points={challenge.points} size="lg" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl uppercase">Odeslat důkaz</h2>

        {!session?.user ? (
          <div className="comic-panel p-5 font-mono text-sm">
            Pro odeslání důkazu se musíš{" "}
            <Link href="/login" className="underline">
              přihlásit
            </Link>
            .
          </div>
        ) : mySubmission ? (
          <div className="comic-panel p-5 flex flex-col gap-2">
            <span className="tag tag-filled w-fit">{STATUS_LABEL[mySubmission.status]}</span>
            <p className="font-mono text-sm break-all">{mySubmission.proofUrl}</p>
            {mySubmission.status === "APPROVED" && (
              <p className="font-mono text-sm">Připsáno: {mySubmission.pointsAwarded} bodů</p>
            )}
            {mySubmission.status === "REJECTED" && mySubmission.reviewNote && (
              <p className="font-mono text-sm text-steel">Poznámka admina: {mySubmission.reviewNote}</p>
            )}
            <p className="font-mono text-[11px] text-steel mt-2">
              Tuto výzvu jsi v tomto týdnu (#{week.number}) už odeslal/a.
            </p>
          </div>
        ) : (
          <SubmitProofForm challengeId={challenge.id} />
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl uppercase">Žebříček této výzvy</h2>
        <div className="comic-panel">
          {leaderboard.length === 0 ? (
            <p className="font-mono text-sm text-steel p-5">
              Ještě nikdo tuto výzvu nesplnil. Buď první!
            </p>
          ) : (
            <table className="w-full">
              <tbody>
                {leaderboard.map((row, i) => (
                  <tr key={row.userId} className={i !== leaderboard.length - 1 ? "border-b-2 border-ink" : ""}>
                    <td className="font-mono scoreboard-num text-lg px-5 py-3 w-14">
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td className="font-display uppercase px-2 py-3">{row.name}</td>
                    <td className="font-mono text-xs text-steel px-2 py-3">
                      {row.approvedCount}× splněno
                    </td>
                    <td className="font-mono scoreboard-num text-lg px-5 py-3 text-right">
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
