import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ChallengeCard from "@/components/ChallengeCard";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: { kategorie?: string };
};

export default async function ChallengesPage({ searchParams }: Props) {
  const filter = searchParams.kategorie === "GAME" || searchParams.kategorie === "IRL"
    ? searchParams.kategorie
    : undefined;

  const challenges = await prisma.challenge.findMany({
    where: { isArchived: false, ...(filter ? { category: filter } : {}) },
    orderBy: [{ points: "desc" }],
  });

  const filters = [
    { key: undefined, label: "Vše" },
    { key: "GAME", label: "Hry" },
    { key: "IRL", label: "IRL" },
  ] as const;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-3xl sm:text-4xl uppercase">Výzvy</h1>
        <p className="font-mono text-xs text-steel max-w-xl">
          Vyber si výzvu, splň ji, natoč nebo vyfoť důkaz a nahraj odkaz. Admin to vyhodnotí
          a body se připíšou do žebříčku.
        </p>
      </div>

      <div className="flex gap-2">
        {filters.map((f) => (
          <Link
            key={f.label}
            href={f.key ? `/challenges?kategorie=${f.key}` : "/challenges"}
            className={f.key === filter || (!f.key && !filter) ? "tag tag-filled" : "tag"}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {challenges.length === 0 ? (
        <p className="font-mono text-sm text-steel">V této kategorii zatím nejsou žádné výzvy.</p>
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
    </div>
  );
}
