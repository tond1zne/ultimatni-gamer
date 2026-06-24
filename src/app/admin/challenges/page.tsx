"use server";

import { prisma } from "@/lib/prisma";
import { createChallenge, toggleArchiveChallenge } from "@/actions/admin";

export const dynamic = "force-dynamic";

const DIFFICULTY_LABEL: Record<string, string> = {
  EASY: "LEHKA (málo bodů)",
  MEDIUM: "STŘEDNÍ",
  HARD: "TĚŽKÁ",
  INSANE: "ŠÍLENÁ (hodně bodů)",
};

export default async function AdminChallengesPage() {
  const challenges = await prisma.challenge.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="flex flex-col gap-10">
      <div>
        <Link href="/admin" className="font-mono text-xs uppercase tracking-widest hover:underline">
          ← Admin
        </Link>
        <h1 className="font-display text-3xl sm:text-4xl uppercase mt-2">Výzvy</h1>
      </div>

      <div className="comic-panel p-6">
        <h2 className="font-display text-xl uppercase mb-4">Nová výzva</h2>

        {/* ✅ JEDINÁ DŮLEŽITÁ OPRAVA: Server Action musí být Promise<void> */}
        <form action={createChallenge} className="grid sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 font-mono text-[11px] uppercase tracking-widest sm:col-span-2">
            Název
            <input name="title" required className="input-comic" placeholder="Např. Hole-in-one v golfu" />
          </label>

          <label className="flex flex-col gap-1 font-mono text-[11px] uppercase tracking-widest sm:col-span-2">
            Popis (co přesně splnit a jaký důkaz nahrát)
            <textarea name="description" required rows={3} className="input-comic" />
          </label>

          <label className="flex flex-col gap-1 font-mono text-[11px] uppercase tracking-widest">
            Kategorie
            <select name="category" required className="input-comic">
              <option value="GAME">Hra</option>
              <option value="IRL">IRL</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 font-mono text-[11px] uppercase tracking-widest">
            Obtížnost
            <select name="difficulty" required className="input-comic" defaultValue="MEDIUM">
              {Object.entries(DIFFICULTY_LABEL).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 font-mono text-[11px] uppercase tracking-widest">
            Body
            <input name="points" type="number" min={1} required className="input-comic" placeholder="30" />
          </label>

          <div className="flex items-end">
            <button type="submit" className="btn-comic">
              Vytvořit výzvu
            </button>
          </div>
        </form>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl uppercase">Všechny výzvy</h2>

        <div className="flex flex-col gap-3">
          {challenges.map((c) => (
            <div key={c.id} className="comic-panel-tight p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="font-display uppercase">{c.title}</span>
                  {c.isArchived && <span className="tag">ARCHIVOVÁNO</span>}
                </div>

                <span className="font-mono text-[11px] text-steel">
                  {c.category === "GAME" ? "Hra" : "IRL"} · {DIFFICULTY_LABEL[c.difficulty]} · {c.points} bodů
                </span>
              </div>

              {/* ✅ MUSÍ být Promise<void> server action */}
              <form action={toggleArchiveChallenge}>
                <input type="hidden" name="challengeId" value={c.id} />
                <button type="submit" className="btn-comic-outline text-xs">
                  {c.isArchived ? "Obnovit" : "Archivovat"}
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
