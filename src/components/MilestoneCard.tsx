import { siteConfig } from "@/config/site";

export type Milestone = {
  milestone: number;
  side: "bride" | "groom";
  emoji: string | null;
  message: string | null;
};

export default function MilestoneCard({ milestone }: { milestone: Milestone }) {
  const { milestoneCard, sides } = siteConfig;

  const title = milestoneCard.reached[milestone.side]
    .replace("{name}", sides[milestone.side].name)
    .replace("{count}", String(milestone.milestone));

  return (
    <div
      aria-live="polite"
      className="flex items-start gap-4 rounded-2xl border border-gold bg-paper-deep px-4 py-4 text-right"
    >
      <span className="text-4xl leading-none" aria-hidden="true">
        {milestone.emoji ?? milestoneCard.defaultEmoji}
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-base font-medium text-dark-gold">{title}</p>
        {milestone.message && (
          <p className="text-lg leading-relaxed text-ink">{milestone.message}</p>
        )}
      </div>
    </div>
  );
}