import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/config/site";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import SignOutButton from "@/components/SignOutButton";
import VoteForm from "@/components/VoteForm";
import Results from "@/components/Results";
import RefCapture from "@/components/RefCapture";
import Quiz, { type QuizQuestion } from "@/components/Quiz";
import type { Milestone } from "@/components/MilestoneCard";
import type { SpecialMessage } from "@/components/SpecialMessageCard";

type Summary = { ok: boolean; total?: number };
type Status = {
  ok: boolean;
  state?: string;
  role?: string;
  voting_open?: boolean;
  bride?: number;
  groom?: number;
  side?: "bride" | "groom";
  milestone?: Milestone | null;
  special?: SpecialMessage | null;
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string }>;
}) {
  const { auth } = await searchParams;
  const { weddingId, sides, home, states } = siteConfig;

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  const { data: summaryData } = await supabase.rpc("get_public_summary", {
    p_wedding: weddingId,
  });
  const summary = summaryData as Summary | null;

  let status: Status | null = null;
  if (user) {
    const { data: statusData } = await supabase.rpc("get_my_status", {
      p_wedding: weddingId,
    });
    status = statusData as Status | null;
  }

  let quiz: QuizQuestion[] = [];
  if (user && status?.ok && status.state === "voted") {
    const { data: quizData } = await supabase.rpc("get_quiz", {
      p_wedding: weddingId,
    });
    const parsed = quizData as { ok: boolean; questions?: QuizQuestion[] } | null;
    if (parsed?.ok) quiz = parsed.questions ?? [];
  }

  const fullName: string =
    user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "";
  const firstName = fullName.trim().split(" ")[0];

  function stateMessage(s: Status) {
    if (s.state === "role") {
      return s.role === "bride" ? states.roleBride : states.roleGroom;
    }
    if (s.state === "voted") return states.voted;
    if (s.state === "removed") return states.removed;
    if (s.state === "closed") return states.closed;
    return states.error;
  }

  const showResults =
    !!user && !!status?.ok && (status.state === "voted" || status.state === "role");

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <RefCapture />

      <div className="h-px w-16 bg-gold" />

      <h1 className="flex flex-col items-center gap-1 font-[family-name:var(--font-amiri)] text-5xl leading-tight text-ink sm:flex-row sm:gap-4 sm:text-6xl">
        <span>{sides.groom.name} {sides.groom.label}</span>
        <span className="text-3xl text-dark-gold">و</span>
        <span>{sides.bride.name} {sides.bride.label}</span>
      </h1>

      {!user && <p className="text-lg text-ink-soft">{home.tagline}</p>}

      <div className="h-px w-24 bg-gold" />

      {summary?.ok && !showResults && (
        <p className="flex items-baseline gap-2 text-lg text-ink">
          <span>{siteConfig.summary.participants}:</span>
          <span className="text-3xl font-bold text-gold">{summary.total}</span>
        </p>
      )}

      {!user ? (
        <>
          <GoogleSignInButton />
          <p className="text-sm text-ink-soft">{home.privacyNote}</p>
          {auth === "error" && (
            <p className="text-sm text-ink">{home.authError}</p>
          )}
        </>
      ) : (
        <div className="flex w-full flex-col items-center gap-5">
          <p className="font-[family-name:var(--font-amiri)] text-3xl text-ink">
            {home.welcome} {firstName}
          </p>

          {status?.ok && status.state === "can_vote" ? (
            <VoteForm />
          ) : showResults && status ? (
            <>
              <Results
                weddingId={weddingId}
                initial={{
                  bride: status.bride ?? 0,
                  groom: status.groom ?? 0,
                  open: status.voting_open ?? true,
                  milestone: status.milestone ?? null,
                }}
                mySide={status.side}
                message={stateMessage(status)}
                canShare={status.state === "voted"}
                special={status.special ?? null}
              />
              {quiz.length > 0 && <Quiz weddingId={weddingId} initial={quiz} />}
            </>
          ) : (
            <p className="max-w-[420px] text-xl leading-relaxed text-ink">
              {status?.ok ? stateMessage(status) : states.error}
            </p>
          )}

          {status?.state === "role" && status.role && (
            <Link
              href={`/${status.role}`}
              className="flex min-h-12 items-center rounded-xl border border-gold bg-white px-6 text-lg text-ink"
            >
              {siteConfig.dashboard.title[status.role as "bride" | "groom"]}
            </Link>
          )}

          <SignOutButton />
        </div>
      )}
    </main>
  );
}