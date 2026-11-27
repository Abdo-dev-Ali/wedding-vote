"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/config/site";

type Side = "bride" | "groom";
type Voter = {
  id: string;
  name: string;
  phone: string;
  message: string | null;
  voted_at: string;
};
type Hour = { hour: string; count: number };
export type DashboardData = { total: number; voters: Voter[]; hourly: Hour[] };

const barColor: Record<Side, string> = { groom: "bg-groom", bride: "bg-bride" };
const PHONE_RE = /^01[0125][0-9]{8}$/;

// رقم دولي لواتساب، والنص بـ encodeURIComponent
function whatsappLink(phone: string, name: string) {
  if (!PHONE_RE.test(phone)) return null;
  const first = name.trim().split(/\s+/)[0] || name;
  const text = siteConfig.dashboard.whatsappText.replace("{name}", first);
  return `https://wa.me/20${phone.slice(1)}?text=${encodeURIComponent(text)}`;
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Cairo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

function HourlyChart({ hourly, side }: { hourly: Hour[]; side: Side }) {
  const scroller = useRef<HTMLDivElement>(null);
  const max = Math.max(1, ...hourly.map((h) => h.count));

  // يفتح على آخر ساعات
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [hourly.length]);

  if (hourly.length === 0) {
    return <p className="text-base text-ink-soft">{siteConfig.dashboard.chartEmpty}</p>;
  }

  return (
    <div ref={scroller} dir="ltr" className="overflow-x-auto pb-2">
      <div className="flex min-w-full items-end gap-1.5">
        {hourly.map((h, i) => {
          const [date, time] = h.hour.split("T");
          const hh = time.slice(0, 2);
          const showDate = i === 0 || hh === "00";
          const height =
            h.count === 0 ? 0 : Math.max(6, Math.round((h.count / max) * 120));
          return (
            <div key={h.hour} className="flex w-9 shrink-0 flex-col items-center gap-1">
              <span className="h-5 text-sm tabular-nums text-ink">
                {h.count > 0 ? h.count : ""}
              </span>
              <div className="flex h-[120px] w-full items-end">
                <div
                  className={`w-full rounded-t ${barColor[side]}`}
                  style={{ height }}
                />
              </div>
              <span className="text-sm text-ink-soft">{hh}</span>
              <span className="h-4 text-xs text-ink-soft">
                {showDate ? date.slice(5).replace("-", "/") : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SideDashboard({
  side,
  weddingId,
  data,
}: {
  side: Side;
  weddingId: string;
  data: DashboardData;
}) {
  const router = useRouter();
  const d = siteConfig.dashboard;
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // تحديث القائمة تلقائيًا لما الصفحة تكون ظاهرة
  useEffect(() => {
    const ms = Math.max(10, d.refreshSeconds) * 1000;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, ms);
    return () => clearInterval(id);
  }, [router, d.refreshSeconds]);

  async function remove(voteId: string) {
    setError("");
    setBusyId(voteId);
    const supabase = createClient();
    const { data: res, error: rpcError } = await supabase.rpc("delete_voter", {
      p_wedding: weddingId,
      p_vote_id: voteId,
    });
    setBusyId(null);

    if (rpcError || !res || (!res.ok && res.reason !== "not_found")) {
      setError(d.deleteError);
      return;
    }
    setConfirmId(null);
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[640px] flex-col gap-6 px-5 py-8 text-right">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-[family-name:var(--font-amiri)] text-4xl text-ink">
          {d.title[side]}
        </h1>
        <Link href="/" className="text-base text-dark-gold underline">
          {d.back}
        </Link>
      </div>

      <section className="flex items-baseline justify-between rounded-2xl border border-gold bg-white px-5 py-4">
        <span className="text-lg text-ink">{d.votersCount}</span>
        <span className="text-4xl font-bold tabular-nums text-gold">{data.total}</span>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-gold bg-white px-5 py-4">
        <h2 className="text-lg font-medium text-ink">{d.chartTitle}</h2>
        <HourlyChart hourly={data.hourly} side={side} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-ink">{d.listTitle}</h2>

        {error && (
          <p role="alert" className="text-base font-medium text-ink">
            {error}
          </p>
        )}

        {data.voters.length === 0 ? (
          <p className="text-base text-ink-soft">{d.listEmpty}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {data.voters.map((v) => {
              const wa = whatsappLink(v.phone, v.name);
              const confirming = confirmId === v.id;
              const busy = busyId === v.id;
              return (
                <li
                  key={v.id}
                  className="flex flex-col gap-3 rounded-2xl border border-gold bg-white p-4"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-xl font-medium text-ink">{v.name}</span>
                    <span dir="ltr" className="self-start text-lg tabular-nums text-ink-soft">
                      {v.phone}
                    </span>
                    <span dir="ltr" className="self-start text-sm tabular-nums text-ink-soft">
                      {formatTime(v.voted_at)}
                    </span>
                  </div>

                  <p className="text-base leading-relaxed text-ink">
                    {v.message ? v.message : <span className="text-ink-soft">{d.noMessage}</span>}
                  </p>

                  {confirming ? (
                    <div className="flex flex-col gap-2">
                      <p className="text-base text-ink">
                        {d.confirmDelete.replace("{name}", v.name)}
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => remove(v.id)}
                          className="min-h-11 rounded-lg bg-ink-soft px-4 text-base text-white disabled:opacity-60"
                        >
                          {d.confirmYes}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setConfirmId(null)}
                          className="min-h-11 rounded-lg border border-ink-soft px-4 text-base text-ink"
                        >
                          {d.confirmNo}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {wa && (
                        <a
                          href={wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center rounded-lg bg-ink-soft px-4 text-base text-white"
                        >
                          {d.whatsapp}
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setConfirmId(v.id)}
                        className="min-h-11 rounded-lg border border-ink-soft px-4 text-base text-ink"
                      >
                        {d.delete}
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}