"use client";

import { useEffect, useState } from "react";

function getParts(ms: number) {
  const clamped = Math.max(0, ms);
  const days = Math.floor(clamped / (24 * 60 * 60 * 1000));
  const hours = Math.floor((clamped / (60 * 60 * 1000)) % 24);
  const minutes = Math.floor((clamped / (60 * 1000)) % 60);
  const seconds = Math.floor((clamped / 1000) % 60);
  return { days, hours, minutes, seconds };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function Countdown({ endsAt }: { endsAt: string }) {
  const target = new Date(endsAt).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) {
    return (
      <div className="flex gap-2 font-mono text-2xl scoreboard-num">
        <span>--</span>:<span>--</span>:<span>--</span>:<span>--</span>
      </div>
    );
  }

  const { days, hours, minutes, seconds } = getParts(target - now);
  const isOver = target - now <= 0;

  return (
    <div className="flex items-end gap-3">
      {[
        { label: "DNI", value: days },
        { label: "HOD", value: hours },
        { label: "MIN", value: minutes },
        { label: "SEK", value: seconds },
      ].map((unit) => (
        <div key={unit.label} className="flex flex-col items-center">
          <div className="comic-panel-tight bg-ink px-3 py-1">
            <span className="font-mono scoreboard-num text-2xl sm:text-3xl text-paper">
              {pad(unit.value)}
            </span>
          </div>
          <span className="font-mono text-[10px] mt-1 tracking-widest text-steel">
            {unit.label}
          </span>
        </div>
      ))}
      {isOver && (
        <span className="font-display text-xs tracking-widest ml-2 animate-flicker">
          UZAVIRA SE...
        </span>
      )}
    </div>
  );
}
