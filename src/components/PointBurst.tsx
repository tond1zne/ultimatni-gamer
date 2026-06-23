type Props = {
  points: number;
  size?: "sm" | "md" | "lg";
};

const SIZES: Record<string, { box: number; text: string }> = {
  sm: { box: 56, text: "text-sm" },
  md: { box: 76, text: "text-lg" },
  lg: { box: 110, text: "text-3xl" },
};

export default function PointBurst({ points, size = "md" }: Props) {
  const { box, text } = SIZES[size];

  return (
    <div className="burst" style={{ width: box, height: box }}>
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon
          points="50,2 61,22 83,15 78,38 99,46 78,57 86,79 63,72 56,95 47,73 25,82 28,59 4,53 24,42 16,20 39,26"
          fill="#0a0a0a"
        />
      </svg>
      <span className={`font-display text-paper leading-none text-center ${text}`}>
        +{points}
      </span>
    </div>
  );
}
