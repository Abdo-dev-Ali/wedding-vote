import { siteConfig } from "@/config/site";

export type SpecialMessage = { from_side: "bride" | "groom"; message: string };

export default function SpecialMessageCard({ special }: { special: SpecialMessage }) {
  const { specialMessage } = siteConfig;

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-gold bg-paper-deep px-4 py-4 text-right">
      <p className="text-base font-medium text-dark-gold">
        {specialMessage.title[special.from_side]}
      </p>
      <p className="whitespace-pre-line text-lg leading-relaxed text-ink">
        {special.message}
      </p>
    </div>
  );
}