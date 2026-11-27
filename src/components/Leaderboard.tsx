import { siteConfig } from "@/config/site";

export type LeaderRow = { name: string; count: number };

export default function Leaderboard({ rows }: { rows: LeaderRow[] }) {
  if (rows.length === 0) return null;
  const { leaderboard } = siteConfig;

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-gold bg-white px-4 py-4 text-right">
      <h2 className="font-[family-name:var(--font-amiri)] text-2xl text-ink">
        {leaderboard.title}
      </h2>
      <ol className="flex flex-col gap-2">
        {rows.map((r, i) => (
          <li key={`${r.name}-${i}`} className="flex items-center gap-3 text-lg text-ink">
            <span className="w-6 text-center font-bold tabular-nums text-dark-gold">
              {i + 1}
            </span>
            <span className="flex-1">{r.name}</span>
            <span className="tabular-nums text-ink-soft">
              {r.count} {leaderboard.votes}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}