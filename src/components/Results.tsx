"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/config/site";
import MilestoneCard, { type Milestone } from "@/components/MilestoneCard";
import Leaderboard, { type LeaderRow } from "@/components/Leaderboard";
import ShareBox from "@/components/ShareBox";
import SpecialMessageCard, { type SpecialMessage } from "@/components/SpecialMessageCard";

type Side = "bride" | "groom";
type Scores = {
  bride: number;
  groom: number;
  open: boolean;
  milestone: Milestone | null;
  leaderboard: LeaderRow[];
};

const barColors: Record<Side, string> = {
  groom: "bg-groom",
  bride: "bg-bride",
};

// رقم بيعدّ من القيمة القديمة للجديدة، وبيتلغي لو الجهاز مفعّل "تقليل الحركة"
function useCountUp(target: number) {
  const [value, setValue] = useState(0);
  const currentRef = useRef(0);

  useEffect(() => {
    const from = currentRef.current;
    if (from === target) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduce ? 0 : 700;
    const start = performance.now();
    let raf = 0;

    function tick(now: number) {
      const t = duration === 0 ? 1 : Math.max(0, Math.min(1, (now - start) / duration));
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(from + (target - from) * eased);
      currentRef.current = next;
      setValue(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return value;
}

function SideRow({ side, count, total }: { side: Side; count: number; total: number }) {
  const { sides } = siteConfig;
  const shown = useCountUp(count);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const percent = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end justify-between">
        <span className="flex items-center gap-2 font-[family-name:var(--font-amiri)] text-2xl text-ink">
          <span className={`h-3 w-3 rounded-full ${barColors[side]}`} />
          {sides[side].name} {sides[side].label}
        </span>
        <span className="text-4xl font-bold tabular-nums text-gold">{shown}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-paper-deep" aria-hidden="true">
        <div
          className={`h-full rounded-full ${barColors[side]} transition-[width] duration-700 ease-out motion-reduce:transition-none`}
          style={{ width: mounted ? `${percent}%` : "0%" }}
        />
      </div>
    </div>
  );
}

export default function Results({
  weddingId,
  initial,
  mySide,
  message,
  canShare = false,
  special = null,
}: {
  weddingId: string;
  initial: Omit<Scores, "leaderboard">;
  mySide?: Side;
  message: string;
  canShare?: boolean;
  special?: SpecialMessage | null;
}) {
  const router = useRouter();
  const { sides, results, summary, states } = siteConfig;
  const [scores, setScores] = useState<Scores>({ ...initial, leaderboard: [] });

  useEffect(() => {
    const supabase = createClient();
    const intervalMs = Math.max(5, results.pollSeconds) * 1000;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    async function fetchScores() {
      const { data } = await supabase.rpc("get_scores", { p_wedding: weddingId });
      if (cancelled || !data) return;
      if (data.ok) {
        setScores({
          bride: data.bride,
          groom: data.groom,
          open: data.voting_open,
          milestone: data.milestone ?? null,
          leaderboard: data.leaderboard ?? [],
        });
      } else if (data.reason === "not_authenticated" || data.reason === "not_allowed") {
        // حالة الحساب اتغيرت (مثلًا صوته اتحذف): الصفحة تعرض الحالة الجديدة
        router.refresh();
      }
    }

    // أول تحميل دايمًا، وبعدها التحديث الدوري لو التصويت مفتوح
    fetchScores();
    if (!scores.open) {
      return () => {
        cancelled = true;
      };
    }

    function schedule() {
      clearTimeout(timer);
      // زيادة عشوائية صغيرة عشان الطلبات ما تيجيش كلها في نفس اللحظة
      timer = setTimeout(async () => {
        if (document.visibilityState === "visible") await fetchScores();
        if (!cancelled) schedule();
      }, intervalMs + Math.random() * 2000);
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        clearTimeout(timer);
        fetchScores().finally(() => {
          if (!cancelled) schedule();
        });
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    schedule();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [scores.open, weddingId, router, results.pollSeconds]);

  const total = scores.bride + scores.groom;

  return (
    <div className="flex w-full max-w-[420px] flex-col gap-6 text-right">
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-xl leading-relaxed text-ink">{message}</p>
        {mySide && (
          <p className="text-base text-ink-soft">
            {results.yourChoice}: {sides[mySide].name} {sides[mySide].label}
          </p>
        )}
      </div>

      {special && <SpecialMessageCard special={special} />}

      {scores.milestone && <MilestoneCard milestone={scores.milestone} />}

      <SideRow side="groom" count={scores.groom} total={total} />
      <SideRow side="bride" count={scores.bride} total={total} />

      <p className="flex items-baseline justify-center gap-2 text-base text-ink-soft">
        <span>{summary.participants}:</span>
        <span className="text-xl font-bold text-ink">{total}</span>
      </p>

      {canShare && <ShareBox weddingId={weddingId} />}

      <Leaderboard rows={scores.leaderboard} />

      {!scores.open && (
        <p className="text-center text-base text-ink">{states.closed}</p>
      )}
    </div>
  );
}