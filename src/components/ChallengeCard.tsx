import Link from "next/link";
import PointBurst from "@/components/PointBurst";

const DIFFICULTY_LABEL: Record<string, string> = {
  EASY: "LEHKA",
  MEDIUM: "STREDNI",
  HARD: "TEZKA",
  INSANE: "SILENA",
};

type Props = {
  id: string;
  title: string;
  description: string;
  category: "GAME" | "IRL";
  difficulty: "EASY" | "MEDIUM" | "HARD" | "INSANE";
  points: number;
};

export default function ChallengeCard({ id, title, description, category, difficulty, points }: Props) {
  return (
    <Link
      href={`/challenges/${id}`}
      className="comic-panel relative flex flex-col gap-3 p-5 hover:-translate-y-0.5 hover:translate-x-0.5 transition-transform"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <span className={`tag ${category === "GAME" ? "tag-filled" : ""}`}>
            {category === "GAME" ? "HRA" : "IRL"}
          </span>
          <span className="tag">{DIFFICULTY_LABEL[difficulty]}</span>
        </div>
        <PointBurst points={points} size="sm" />
      </div>

      <h3 className="font-display text-xl uppercase leading-tight pr-2">{title}</h3>
      <p className="font-body text-sm text-steel line-clamp-3">{description}</p>

      <span className="font-mono text-[11px] uppercase tracking-widest mt-auto pt-2">
        Zobrazit vyzvu →
      </span>
    </Link>
  );
}
